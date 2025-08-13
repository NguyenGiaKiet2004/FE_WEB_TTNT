import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
      const response = await fetch("http://localhost:3001/api/system/configs", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
    // Don't cache for too long
    staleTime: 5000,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData) => {
      console.log('🔄 Updating settings:', settingsData);
      
      // Convert form data to system config format
      const configUpdates = [
        { key: 'work_start_time', value: settingsData.workStartTime + ':00' },
        { key: 'work_end_time', value: settingsData.workEndTime + ':00' },
        { key: 'late_threshold', value: settingsData.workStartTime + ':00' },
        { key: 'early_departure_threshold', value: settingsData.workEndTime + ':00' },
        { key: 'grace_period_minutes', value: settingsData.gracePeriodMinutes.toString() },
        { key: 'max_late_period_minutes', value: settingsData.maxLatePeriodMinutes.toString() },
        { key: 'recognition_threshold', value: settingsData.recognitionThreshold },
        { key: 'min_training_images', value: settingsData.minTrainingImages.toString() },
        { key: 'email_notifications', value: settingsData.emailNotifications.toString() },
        { key: 'daily_reports', value: settingsData.dailyReports.toString() },
        { key: 'weekly_reports', value: settingsData.weeklyReports.toString() },
      ];

      console.log('📝 Config updates to send:', configUpdates);

      // Update each configuration
      const updatePromises = configUpdates.map(async (config) => {
        console.log(`🔄 Updating ${config.key} = ${config.value}`);
        
        const response = await fetch(`http://localhost:3001/api/system/configs/${config.key}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ value: config.value }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to update ${config.key}:`, errorText);
          throw new Error(`Failed to update ${config.key}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`✅ Updated ${config.key}:`, result.message);
        return result;
      });

      const results = await Promise.all(updatePromises);
      console.log('✅ All settings updated successfully');
      
      return { message: "Settings updated successfully" };
    },
    onSuccess: () => {
      // Invalidate both settings and dashboard cache
      queryClient.invalidateQueries({ queryKey: ["/api/system/configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
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
    if (settings) {
      setFormData({
        workStartTime: settings.work_start_time?.value?.slice(0, 5) || "09:00",
        workEndTime: settings.work_end_time?.value?.slice(0, 5) || "17:00",
        lunchStartTime: settings.lunch_start_time?.value?.slice(0, 5) || "12:00",
        lunchEndTime: settings.lunch_end_time?.value?.slice(0, 5) || "13:00",
        gracePeriodMinutes: parseInt(settings.grace_period_minutes?.value) || 5,
        maxLatePeriodMinutes: parseInt(settings.max_late_period_minutes?.value) || 60,
        recognitionThreshold: settings.recognition_threshold?.value || "0.85",
        minTrainingImages: parseInt(settings.min_training_images?.value) || 2,
        emailNotifications: settings.email_notifications?.value === "true",
        dailyReports: settings.daily_reports?.value === "true",
        weeklyReports: settings.weekly_reports?.value === "true",
      });
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
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
    setFormData(defaultSettings);
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
                  value={formData.gracePeriodMinutes}
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
                  value={formData.maxLatePeriodMinutes}
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
                  value={formData.minTrainingImages}
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
