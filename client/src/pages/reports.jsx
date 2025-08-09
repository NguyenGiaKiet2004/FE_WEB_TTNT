import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/components/dashboard/stats-card";

export default function Reports() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["/api/attendance"],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Reports & Analytics</h2>
        <div className="flex space-x-3">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            <i className="fas fa-download mr-2"></i>
            Export Report
          </Button>
          <Button className="bg-primary text-white hover:bg-blue-600">
            <i className="fas fa-calendar mr-2"></i>
            Date Range
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select defaultValue="monthly">
            <SelectTrigger>
              <SelectValue placeholder="Report Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="attendance">
            <SelectTrigger>
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attendance">Attendance Summary</SelectItem>
              <SelectItem value="employee">Employee Performance</SelectItem>
              <SelectItem value="department">Department Analysis</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-blue-600">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Records"
          value={attendanceRecords.length}
          icon="fas fa-clock text-blue-600"
          iconBg="bg-blue-100"
          trendText="All time attendance records"
        />
        <StatsCard
          title="Present Today"
          value={stats?.onTime || 0}
          icon="fas fa-check text-green-600"
          iconBg="bg-green-100"
          trendText="Employees present today"
        />
        <StatsCard
          title="Late Arrivals"
          value={stats?.lateArrival || 0}
          icon="fas fa-clock text-orange-600"
          iconBg="bg-orange-100"
          trendText="Late arrivals today"
        />
        <StatsCard
          title="Absentees"
          value={stats?.absent || 0}
          icon="fas fa-user-times text-red-600"
          iconBg="bg-red-100"
          trendText="Absent employees today"
        />
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Wise Report */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Attendance</h3>
          <div className="space-y-4">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{dept.name}</div>
                  <div className="text-sm text-gray-500">{dept.employeeCount} employees</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {Math.floor(Math.random() * 90 + 85)}%
                  </div>
                  <div className="text-sm text-gray-500">Attendance Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {attendanceRecords.slice(0, 5).map(record => (
              <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {record.employee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "N/A"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {record.employee?.name || "Unknown Employee"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.status === "present" ? "Checked in" : 
                     record.status === "late" ? "Late arrival" : 
                     record.status} at {record.checkIn || "N/A"}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(record.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
