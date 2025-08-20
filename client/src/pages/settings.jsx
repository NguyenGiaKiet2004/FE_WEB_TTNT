import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    workStartTime: "08:00",
    workEndTime: "17:00",
    lunchStartTime: "12:00",
    lunchEndTime: "13:00",
    gracePeriodMinutes: 5,
    maxLatePeriodMinutes: 60,
    recognitionThreshold: "0.85",
    minTrainingImages: 2,
    emailNotifications: true,
    dailyReports: true,
    weeklyReports: false,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/system/configs"],
    queryFn: async () => {
      console.log('🔄 Fetching settings from API...');
      const response = await apiRequest('/system/configs');
      console.log('🔄 API Response:', response);
      return response;
    },
    // Cache for longer to prevent unnecessary refetches
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Separate query for fresh data after updates
  const { refetch: refetchFreshSettings } = useQuery({
    queryKey: ["/api/system/configs", "fresh"],
    queryFn: async () => {
      console.log('🔄 Fetching fresh settings from API...');
      const response = await apiRequest('/system/configs?fresh=true');
      console.log('🔄 Fresh API Response:', response);
      return response;
    },
    enabled: false, // Don't run automatically
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData) => {
      console.log('🔄 Updating settings:', settingsData);
      
      // Helper function to add minutes to time string (HH:MM)
      const addMinutesToTime = (timeStr, minutes) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
      };

      // Helper function to subtract minutes from time string (HH:MM)
      const subtractMinutesFromTime = (timeStr, minutes) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + mins - minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
      };

      // Convert form data to system config format
      const configUpdates = [
        { key: 'work_start_time', value: settingsData.workStartTime + ':00' },
        { key: 'work_end_time', value: settingsData.workEndTime + ':00' },
        { key: 'lunch_start_time', value: settingsData.lunchStartTime + ':00' },
        { key: 'lunch_end_time', value: settingsData.lunchEndTime + ':00' },
        { key: 'late_threshold', value: addMinutesToTime(settingsData.workStartTime, settingsData.gracePeriodMinutes) + ':00' },
        { key: 'early_departure_threshold', value: subtractMinutesFromTime(settingsData.workEndTime, settingsData.gracePeriodMinutes) + ':00' },
        { key: 'grace_period_minutes', value: settingsData.gracePeriodMinutes.toString() },
        { key: 'max_late_period_minutes', value: settingsData.maxLatePeriodMinutes.toString() },
        { key: 'recognition_threshold', value: settingsData.recognitionThreshold },
        { key: 'min_training_images', value: settingsData.minTrainingImages.toString() },
        { key: 'email_notifications', value: settingsData.emailNotifications.toString() },
        { key: 'daily_reports', value: settingsData.dailyReports.toString() },
        { key: 'weekly_reports', value: settingsData.weeklyReports.toString() },
      ];

      console.log('📝 Config updates to send:', configUpdates);
      
      // Log grouped by sections for clarity
      console.log('📋 Working Hours:', configUpdates.filter(c => ['work_start_time', 'work_end_time', 'lunch_start_time', 'lunch_end_time'].includes(c.key)));
      console.log('📋 Late Arrival:', configUpdates.filter(c => ['late_threshold', 'early_departure_threshold', 'grace_period_minutes', 'max_late_period_minutes'].includes(c.key)));
      console.log('📋 Face Recognition:', configUpdates.filter(c => ['recognition_threshold', 'min_training_images'].includes(c.key)));
      console.log('📋 Notifications:', configUpdates.filter(c => ['email_notifications', 'daily_reports', 'weekly_reports'].includes(c.key)));

      // Update each configuration
      const updatePromises = configUpdates.map(async (config) => {
        console.log(`🔄 Updating ${config.key} = ${config.value}`);
        
        const result = await apiRequest(`/system/configs/${config.key}`, {
          method: "PUT",
          body: JSON.stringify({ value: config.value }),
        });
        
        console.log(`✅ Updated ${config.key}:`, result.message);
        return result;
      });

      const results = await Promise.all(updatePromises);
      console.log('✅ All settings updated successfully');
      
      return { message: "Settings updated successfully" };
    },
    onSuccess: async (data) => {
      console.log('🔄 Settings updated - Invalidating all related data...');
      
      // Invalidate ALL related queries that depend on system configs
      const queriesToInvalidate = [
        ["/api/system/configs"],
        ["/api/dashboard/stats"],
        ["/api/attendance"],
        ["/api/employees"],
        ["/api/reports"],
        ["/api/departments"]
      ];
      
      // Invalidate each query
      queriesToInvalidate.forEach(queryKey => {
        console.log(`🔄 Invalidating query: ${queryKey}`);
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Get fresh data from server (bypass cache)
      const freshData = await refetchFreshSettings();
      
      // Update the main query with fresh data
      if (freshData.data) {
        queryClient.setQueryData(["/api/system/configs"], freshData.data);
      }
      
      toast({
        title: "Success",
        description: "Settings updated successfully. All related data will refresh automatically.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load settings when data is available
  useEffect(() => {
    console.log('🔄 useEffect triggered, settings:', settings);
    if (settings?.configs) {
      const configs = settings.configs;
      console.log('🔄 Loading settings from server:', configs);
      
      // Validate and sanitize config values
      const sanitizeConfig = (configKey, defaultValue) => {
        const config = configs[configKey];
        if (!config || !config.value) return defaultValue;
        
        // Handle different data types
        if (typeof defaultValue === 'number') {
          const parsed = parseInt(config.value);
          return isNaN(parsed) ? defaultValue : parsed;
        }
        if (typeof defaultValue === 'boolean') {
          return config.value === 'true';
        }
        return config.value || defaultValue;
      };
      console.log('🔄 Working Hours:', {
        work_start_time: configs.work_start_time?.value,
        work_end_time: configs.work_end_time?.value,
        lunch_start_time: configs.lunch_start_time?.value,
        lunch_end_time: configs.lunch_end_time?.value
      });
      console.log('🔄 Late Arrival:', {
        grace_period_minutes: configs.grace_period_minutes?.value,
        max_late_period_minutes: configs.max_late_period_minutes?.value
      });
      console.log('🔄 Face Recognition:', {
        recognition_threshold: configs.recognition_threshold?.value,
        min_training_images: configs.min_training_images?.value
      });
      console.log('🔄 Notifications:', {
        email_notifications: configs.email_notifications?.value,
        daily_reports: configs.daily_reports?.value,
        weekly_reports: configs.weekly_reports?.value
      });
      
      const newFormData = {
        workStartTime: (() => {
          const time = configs.work_start_time?.value?.slice(0, 5);
          console.log('🔄 Parsing workStartTime:', configs.work_start_time?.value, '->', time);
          return time || "09:00";
        })(),
        workEndTime: (() => {
          const time = configs.work_end_time?.value?.slice(0, 5);
          console.log('🔄 Parsing workEndTime:', configs.work_end_time?.value, '->', time);
          return time || "17:00";
        })(),
        lunchStartTime: (() => {
          const time = configs.lunch_start_time?.value?.slice(0, 5);
          console.log('🔄 Parsing lunchStartTime:', configs.lunch_start_time?.value, '->', time);
          return time || "12:00";
        })(),
        lunchEndTime: (() => {
          const time = configs.lunch_end_time?.value?.slice(0, 5);
          console.log('🔄 Parsing lunchEndTime:', configs.lunch_end_time?.value, '->', time);
          return time || "13:00";
        })(),
        gracePeriodMinutes: sanitizeConfig('grace_period_minutes', 5),
        maxLatePeriodMinutes: sanitizeConfig('max_late_period_minutes', 60),
        recognitionThreshold: sanitizeConfig('recognition_threshold', "0.85"),
        minTrainingImages: sanitizeConfig('min_training_images', 2),
        emailNotifications: sanitizeConfig('email_notifications', true),
        dailyReports: sanitizeConfig('daily_reports', true),
        weeklyReports: sanitizeConfig('weekly_reports', false),
      };
      
      console.log('🔄 Setting form data:', newFormData);
      
      // Check for NaN values and fix them
      Object.entries(newFormData).forEach(([key, value]) => {
        if (typeof value === 'number' && isNaN(value)) {
          console.warn(`⚠️ NaN detected in ${key}:`, value);
          // Fix NaN values with defaults
          if (key === 'gracePeriodMinutes') newFormData[key] = 5;
          else if (key === 'maxLatePeriodMinutes') newFormData[key] = 60;
          else if (key === 'minTrainingImages') newFormData[key] = 2;
        }
      });
      
      setFormData(newFormData);
    } else {
      console.log('🔄 No settings configs found');
    }
  }, [settings]);

  // Helper functions for time calculations
  const addMinutesToTime = (timeStr, minutes) => {
    if (!timeStr || !minutes) return timeStr;
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const subtractMinutesFromTime = (timeStr, minutes) => {
    if (!timeStr || !minutes) return timeStr;
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins - minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field, value) => {
    // Validate numeric inputs to prevent NaN
    if (['gracePeriodMinutes', 'maxLatePeriodMinutes', 'minTrainingImages'].includes(field)) {
      if (value === '' || isNaN(value) || value < 0) {
        console.warn(`⚠️ Invalid value for ${field}:`, value);
        return; // Don't update if invalid
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleReset = () => {
    const defaultSettings = {
      workStartTime: "08:00",
      workEndTime: "17:00",
      lunchStartTime: "12:00",
      lunchEndTime: "13:00",
      gracePeriodMinutes: 5,
      maxLatePeriodMinutes: 60,
      recognitionThreshold: "0.85",
      minTrainingImages: 2,
      emailNotifications: true,
      dailyReports: true,
      weeklyReports: false,
    };
    
    console.log('🔄 Resetting form to defaults:', defaultSettings);
    setFormData(defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recognitionThresholdValue = parseFloat(formData.recognitionThreshold);
  const recognitionPercentage = Math.round(recognitionThresholdValue * 100);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Working Hours Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Working Hours Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workStartTime">Start Time</Label>
                <Input
                  id="workStartTime"
                  type="time"
                  value={formData.workStartTime}
                  onChange={(e) => handleInputChange("workStartTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workEndTime">End Time</Label>
                <Input
                  id="workEndTime"
                  type="time"
                  value={formData.workEndTime}
                  onChange={(e) => handleInputChange("workEndTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lunchStartTime">Lunch Break Start</Label>
                <Input
                  id="lunchStartTime"
                  type="time"
                  value={formData.lunchStartTime}
                  onChange={(e) => handleInputChange("lunchStartTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lunchEndTime">Lunch Break End</Label>
                <Input
                  id="lunchEndTime"
                  type="time"
                  value={formData.lunchEndTime}
                  onChange={(e) => handleInputChange("lunchEndTime", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Late Arrival Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Late Arrival Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gracePeriod">Grace Period (minutes)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.gracePeriodMinutes || ''}
                  onChange={(e) => handleInputChange("gracePeriodMinutes", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Employees arriving within this period won't be marked as late
                </p>

              </div>
              <div>
                <Label htmlFor="maxLatePeriod">Maximum Late Time (minutes)</Label>
                <Input
                  id="maxLatePeriod"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.maxLatePeriodMinutes || ''}
                  onChange={(e) => handleInputChange("maxLatePeriodMinutes", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  After this time, employee will be marked as absent
                </p>

              </div>
            </div>
          </div>

          {/* Face Recognition Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Face Recognition Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recognitionThreshold">Recognition Confidence Threshold</Label>
                <div className="mt-2">
                  <Slider
                    id="recognitionThreshold"
                    value={[recognitionThresholdValue]}
                    onValueChange={(value) => handleInputChange("recognitionThreshold", value[0].toFixed(2))}
                    max={0.99}
                    min={0.70}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>70%</span>
                    <span className="font-medium">{recognitionPercentage}%</span>
                    <span>99%</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="minTrainingImages">Minimum Training Images</Label>
                <Input
                  id="minTrainingImages"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.minTrainingImages || ''}
                  onChange={(e) => handleInputChange("minTrainingImages", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum number of face images required per employee
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
                <Label htmlFor="emailNotifications" className="text-sm text-gray-700">
                  Email notifications for late arrivals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dailyReports"
                  checked={formData.dailyReports}
                  onCheckedChange={(checked) => handleInputChange("dailyReports", checked)}
                />
                <Label htmlFor="dailyReports" className="text-sm text-gray-700">
                  Daily attendance reports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weeklyReports"
                  checked={formData.weeklyReports}
                  onCheckedChange={(checked) => handleInputChange("weeklyReports", checked)}
                />
                <Label htmlFor="weeklyReports" className="text-sm text-gray-700">
                  Weekly summary reports
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="bg-primary text-white hover:bg-blue-600"
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
