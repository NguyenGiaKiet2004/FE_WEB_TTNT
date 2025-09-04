import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StatsCard from "@/components/dashboard/stats-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [weeklyPeriod, setWeeklyPeriod] = useState("current");
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [lineAnimation, setLineAnimation] = useState(false);
  const [barAnimation, setBarAnimation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    // Using default queryFn from queryClient (attaches auth header)
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch attendance series for charts (must be declared before any early return)
  const daysByPeriod = chartPeriod === 'monthly' ? 30 : 7;
  const { data: series = { current: [], previous: [] } } = useQuery({
    queryKey: [`/api/attendance/series?period=${chartPeriod}&days=${daysByPeriod}`],
  });

  // Weekly series exclusively for bar chart
  const { data: weeklySeries = { current: [] } } = useQuery({
    queryKey: ["/api/attendance/series?period=weekly&days=7"],
  });

  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 5;
  const { data: attendanceData } = useQuery({
    queryKey: [
      `/api/attendance?page=${attendancePage}&limit=${pageSize}`
    ],
  });
  const attendanceRecords = attendanceData?.records || [];
  const attendanceTotal = attendanceData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(attendanceTotal / pageSize));

  const { data: employeesResponse = { employees: [] } } = useQuery({
    queryKey: ["/api/employees"],
  });
  const employees = employeesResponse?.employees || [];

  // Departments for filter dropdown
  const { data: departmentsResponse } = useQuery({
    queryKey: ["/api/departments"],
  });
  const departments = departmentsResponse?.departments || [];
  const uniqueDepartments = Array.from(new Map((departments || []).map(d => [d.department_id, d])).values());

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Trigger animations when component mounts
  useEffect(() => {
    const timer1 = setTimeout(() => setLineAnimation(true), 300);
    const timer2 = setTimeout(() => setBarAnimation(true), 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const openDetail = async (id) => {
    try {
      const data = await apiRequest(`/api/attendance/detail/${id}`);
      setDetail(data);
      setDetailOpen(true);
    } catch (e) {
      alert('Failed to load detail');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "on_time":
        return <Badge className="bg-green-100 text-green-800">On Time</Badge>;
      case "late":
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case "early_departure":
        return <Badge className="bg-yellow-100 text-yellow-800">Early Leave</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  // Helper function to format trend text
  const formatTrendText = (change, type) => {
    if (type === 'employees') {
      if (change > 0) return `+${change} employees added`;
      if (change < 0) return `${change} employees removed`;
      return 'No change in employees';
    }
    
    const absChange = Math.abs(change);
    if (change > 0) return `+${absChange.toFixed(1)}% increase from yesterday`;
    if (change < 0) return `${absChange.toFixed(1)}% decrease from yesterday`;
    return 'No change from yesterday';
  };

  const statsCards = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: "fas fa-users text-blue-600",
      iconBg: "bg-blue-100",
      trendText: formatTrendText(stats?.employeesAdded || 0, 'employees')
    },
    {
      title: "On Time",
      value: stats?.onTime || 0,
      icon: "fas fa-clock text-green-600",
      iconBg: "bg-green-100",
      trendText: formatTrendText(stats?.onTimeChange || 0)
    },
    {
      title: "Absent",
      value: stats?.absent || 0,
      icon: "fas fa-user-times text-red-600",
      iconBg: "bg-red-100",
      trendText: formatTrendText(stats?.absentChange || 0)
    },
    {
      title: "Late Arrival",
      value: stats?.lateArrival || 0,
      icon: "fas fa-clock text-orange-600",
      iconBg: "bg-orange-100",
      trendText: formatTrendText(stats?.lateArrivalChange || 0)
    },
    {
      title: "Early Departure",
      value: stats?.earlyDeparture || 0,
      icon: "fas fa-sign-out-alt text-yellow-600",
      iconBg: "bg-yellow-100",
      trendText: formatTrendText(stats?.earlyDepartureChange || 0)
    },
    {
      title: "Time-off",
      value: stats?.timeOff || 0,
      icon: "fas fa-calendar-times text-purple-600",
      iconBg: "bg-purple-100",
      trendText: formatTrendText(stats?.timeOffChange || 0)
    }
  ];

  const weeklyAttendanceData = (series.current || []).map((pt, idx) => ({
    day: pt.label,
    current: pt.value,
    previous: series.previous?.[idx]?.value ?? 0,
  }));

  const barWeekData = (weeklySeries.current || []).map((pt) => ({
    day: pt.label,
    current: pt.value,
  }));

  // Data points cho biểu đồ line
  const totalPoints = weeklyAttendanceData.length || 1;
  const step = totalPoints > 1 ? 300 / (totalPoints - 1) : 0; // spread across 50..350
  const lineChartData = weeklyAttendanceData.map((item, i) => ({
    x: 50 + i * step,
    currentY: Math.max(0, 150 - item.current),
    prevY: Math.max(0, 150 - item.previous),
    day: item.day,
    current: item.current,
    previous: item.previous,
  }));

  const handleMouseMove = (e, data) => {
    setTooltipPosition({
      x: e.clientX + 10, // 10px offset from cursor
      y: e.clientY - 10
    });
    setTooltipData(data);
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  return (
    <>
    <div>
      {/* Date Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Today:</h2>
          <p className="text-sm text-gray-600">{currentDate}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Charts Section - Bố trí theo chiều ngang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Comparison Chart - Biểu đồ 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Comparison Chart</h3>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={chartPeriod === "daily" ? "default" : "outline"}
                onClick={() => setChartPeriod("daily")}
              >
                Daily
              </Button>
              <Button 
                size="sm" 
                variant={chartPeriod === "weekly" ? "default" : "outline"}
                onClick={() => setChartPeriod("weekly")}
              >
                Weekly
              </Button>
              <Button 
                size="sm" 
                variant={chartPeriod === "monthly" ? "default" : "outline"}
                onClick={() => setChartPeriod("monthly")}
              >
                Monthly
              </Button>
            </div>
          </div>
          
          {/* Line Chart với Animation */}
          <div className="h-64 relative">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Current Period</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Previous Period</span>
                </div>
              </div>
              <div className="text-green-600 text-sm">
                {chartPeriod === 'daily' && (
                  <>
                    {stats?.onTimeChange > 0 ? `+${stats.onTimeChange}%` : `${stats?.onTimeChange || 0}%`} less than yesterday
                  </>
                )}
                {chartPeriod === 'weekly' && (
                  <>Week-over-week trend</>
                )}
                {chartPeriod === 'monthly' && (
                  <>Month-to-date trend</>
                )}
              </div>
            </div>
            
            <svg className="w-full h-48" viewBox="0 0 400 150">
              {/* Current period line với animation nâng cao */}
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                 points={lineChartData.map(p => `${p.x},${p.currentY}`).join(' ')}
                className={`transition-all duration-2000 ${lineAnimation ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: lineAnimation ? 'none' : '0 1000',
                  strokeDashoffset: lineAnimation ? '0' : '1000',
                  transition: 'stroke-dashoffset 2s ease-in-out, opacity 0.5s ease-in-out',
                  filter: lineAnimation ? 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.3))' : 'none'
                }}
              />
              {/* Previous period line với animation */}
              <polyline
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,5"
                 points={lineChartData.map(p => `${p.x},${p.prevY}`).join(' ')}
                className={`transition-all duration-2000 delay-500 ${lineAnimation ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  strokeDasharray: lineAnimation ? '5,5' : '0 1000',
                  strokeDashoffset: lineAnimation ? '0' : '1000',
                  transition: 'stroke-dashoffset 2s ease-in-out 0.5s, opacity 0.5s ease-in-out 0.5s'
                }}
              />
              {/* Data points với hover effect */}
              {lineChartData.map((point, i) => (
                <g key={i}>
                  <circle 
                    cx={point.x} 
                    cy={point.currentY} 
                    r="8" 
                    fill="#8b5cf6"
                    className={`cursor-pointer hover:r-10 transition-all duration-200 ${lineAnimation ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transition: `opacity 0.3s ease-in-out ${0.8 + i * 0.2}s, r 0.2s ease-in-out`,
                      filter: lineAnimation ? 'drop-shadow(0 0 2px rgba(139, 92, 246, 0.5))' : 'none'
                    }}
                    onMouseMove={(e) => handleMouseMove(e, point)}
                    onMouseLeave={handleMouseLeave}
                  />
                  <circle 
                    cx={point.x} 
                    cy={point.prevY} 
                    r="6" 
                    fill="#9ca3af"
                    className={`cursor-pointer hover:r-8 transition-all duration-200 ${lineAnimation ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transition: `opacity 0.3s ease-in-out ${1.0 + i * 0.2}s`
                    }}
                    onMouseMove={(e) => handleMouseMove(e, point)}
                    onMouseLeave={handleMouseLeave}
                  />
                </g>
              ))}
            </svg>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {weeklyAttendanceData.map((item, idx) => {
                const labelStep = Math.max(1, Math.ceil((weeklyAttendanceData.length || 1) / 7));
                const show = idx % labelStep === 0 || idx === weeklyAttendanceData.length - 1;
                return <span key={`${item.day}-${idx}`}>{show ? item.day : ''}</span>;
              })}
            </div>
          </div>
        </div>

        {/* Weekly Attendance Bar Chart - Biểu đồ 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Attendance</h3>
            <span className="text-sm text-gray-600">Current Week • Average attendance rate: {(
              barWeekData.reduce((acc, x) => acc + (x.current || 0), 0) / (barWeekData.length || 1)
            ).toFixed(0)}%</span>
          </div>
          
          {/* Attendance rate legend */}
          <div className="mb-4 text-xs text-gray-600">
            <div className="mb-2">Average attendance rate: <span className="font-semibold text-gray-800">79%</span></div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>≥90% (Excellent)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>80-89% (Good)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>70-79% (Average)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>&lt;70% (Poor)</span>
              </div>
            </div>
          </div>
          
          {/* Bar Chart với Animation từ dưới lên trên */}
          <div className="h-64 flex items-end justify-around relative px-4">
            {/* Background grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div key={tick} className="border-t border-gray-100 flex items-center">
                  <span className="text-xs text-gray-400 mr-2">{tick}%</span>
                </div>
              ))}
            </div>
            
            {barWeekData.map((item, index) => {
              const height = `${(item.current / 100) * 100}%`;
              let barColor = 'bg-red-500'; // <70%
              if (item.current >= 90) barColor = 'bg-green-500';
              else if (item.current >= 80) barColor = 'bg-blue-500';
              else if (item.current >= 70) barColor = 'bg-orange-500';
              
              return (
                <div key={item.day} className="flex flex-col items-center space-y-2 w-10 relative z-10">
                  <div className="text-xs text-gray-600 font-medium">{item.current}%</div>
                  <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '120px' }}>
                    <div 
                      className={`${barColor} rounded-t transition-all duration-1000 hover:opacity-80`}
                      style={{ 
                        height: barAnimation ? height : '0%',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        transition: `height 1s ease-in-out ${0.2 + index * 0.1}s`
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip toàn cục */}
      {tooltipData && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold text-gray-800">{tooltipData.day}</div>
          <div className="text-primary">Current: {tooltipData.current}%</div>
          <div className="text-gray-500">Previous: {tooltipData.previous}%</div>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Attendance Table - full width */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Attendance</h3>
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="dept-all" value="all">All Departments</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={`dept-${dept.department_id}`} value={String(dept.department_id)}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Employee</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Check In</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Check Out</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords
                  .filter((record) => {
                    const matchesSearch = (record.fullName || "")
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                      String(record.employeeId || "").includes(searchTerm.trim());
                    const matchesDept =
                      departmentFilter === "all" ||
                      String(record.departmentId || "") === String(departmentFilter);
                    return matchesSearch && matchesDept;
                  })
                  .map((record, index) => {
                  const employee = employees.find(emp => String(emp.employeeId) === String(record.employeeId));
                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600 text-xs"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 max-w-[220px] truncate" title={employee?.fullName || record.fullName || 'N/A'}>{employee?.fullName || record.fullName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{employee?.employeeId || record.employeeId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{record.departmentName || employee?.department?.name || 'Unassigned'}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                      <td className="py-3 px-2">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="sm" className="text-primary" onClick={() => openDetail(record.id)}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Showing {(attendancePage - 1) * pageSize + 1}-{Math.min(attendancePage * pageSize, attendanceTotal)} of {attendanceTotal} records</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" onClick={() => setAttendancePage((p) => Math.max(1, p - 1))} disabled={attendancePage === 1}>Previous</Button>
              <Button size="sm" className="bg-primary text-white">{attendancePage}</Button>
              <Button variant="outline" size="sm" onClick={() => {
                if (attendancePage < totalPages) setAttendancePage(attendancePage + 1);
                else alert('No more data');
              }}>Next</Button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        {/* <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-plus text-blue-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Add Employee</h4>
                <p className="text-sm text-gray-600">Add new employee to system</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-green-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Create Department</h4>
                <p className="text-sm text-gray-600">Create new department for company</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-download text-orange-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Export Report</h4>
                <p className="text-sm text-gray-600">Download attendance reports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-cog text-purple-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Settings</h4>
                <p className="text-sm text-gray-600">Setup work hours and policies</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

    </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Detail</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div><strong>Employee:</strong> {detail.user.fullName} (#{detail.user.id})</div>
              <div><strong>Email:</strong> {detail.user.email}</div>
              <div><strong>Department:</strong> {detail.user.departmentName || 'Unassigned'}</div>
              <div><strong>Check In:</strong> {detail.checkIn ? new Date(detail.checkIn).toLocaleString() : '--'}</div>
              <div><strong>Check Out:</strong> {detail.checkOut ? new Date(detail.checkOut).toLocaleString() : '--'}</div>
              <div><strong>Status:</strong> {detail.status}</div>
              <div><strong>Record Date:</strong> {detail.recordDate}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
