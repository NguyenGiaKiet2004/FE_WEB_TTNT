import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-config";
import * as XLSX from 'xlsx';

export default function Attendance() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ["/api/attendance"],
    queryFn: async () => {
      // Use apiRequest helper which handles Vite proxy and auth headers automatically
      const data = await apiRequest('/attendance');
      console.log('✅ Attendance Response:', data);
      return data;
    },
  });

  const attendanceRecords = attendanceResponse?.records || [];

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesStatus = statusFilter === "all" || 
                         record.status === statusFilter;
    
    let matchesDate = true;
    if (dateFrom && record.recordDate < dateFrom) matchesDate = false;
    if (dateTo && record.recordDate > dateTo) matchesDate = false;
    
    return matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "on_time":
        return <Badge className="bg-blue-100 text-blue-800">On Time</Badge>;
      case "late":
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case "time_off":
        return <Badge className="bg-purple-100 text-purple-800">Time Off</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format time to HH:MM:SS
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Calculate working hours: Check Out - Check In
  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) {
      return "N/A";
    }

    try {
      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);
      
      // Check if dates are valid
      if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
        return "N/A";
      }

      // Calculate difference in milliseconds
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      
      // Convert to hours and minutes
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format: "Xh Ym" or "Ym" if less than 1 hour
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else {
        return `${diffMinutes}m`;
      }
    } catch (error) {
      console.error('Error calculating working hours:', error);
      return "N/A";
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredRecords.length === 0) {
      alert('Không có dữ liệu để export!');
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = filteredRecords.map(record => ({
        'Employee Name': record.fullName || 'Unknown',
        'Date': new Date(record.recordDate).toLocaleDateString('vi-VN'),
        'Check In': formatTime(record.checkIn),
        'Check Out': formatTime(record.checkOut),
        'Working Hours': calculateWorkingHours(record.checkIn, record.checkOut),
        'Status': record.status || 'N/A',
        'Notes': record.notes || ''
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Employee Name
        { wch: 12 }, // Date
        { wch: 12 }, // Check In
        { wch: 12 }, // Check Out
        { wch: 15 }, // Working Hours
        { wch: 12 }, // Status
        { wch: 30 }  // Notes
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `attendance_records_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      console.log('✅ Excel file exported successfully:', filename);
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      alert('Có lỗi khi export file Excel!');
    }
  };

  // Clear all filters function
  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
                 <div className="flex space-x-3">
           <Button 
             onClick={exportToExcel}
             className="bg-green-600 text-white hover:bg-green-700"
             disabled={filteredRecords.length === 0}
           >
             <i className="fas fa-download mr-2"></i>
             Export Excel
           </Button>
           <Button 
             onClick={clearFilters}
             className="bg-gray-500 text-white hover:bg-gray-600"
             disabled={dateFrom === "" && dateTo === "" && statusFilter === "all"}
           >
             <i className="fas fa-times mr-2"></i>
             Clear Filters
           </Button>
         </div>
      </div>

             {/* Date Range Filter */}
               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Input
             type="date"
             value={dateFrom}
             onChange={(e) => setDateFrom(e.target.value)}
             placeholder="From Date"
           />
           <Input
             type="date"
             value={dateTo}
             onChange={(e) => setDateTo(e.target.value)}
             placeholder="To Date"
           />
                       <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="on_time">On Time</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="time_off">Time Off</SelectItem>
              </SelectContent>
            </Select>
         </div>
       </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {record.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.fullName || "Unknown Employee"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.recordDate).toLocaleDateString()}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {formatTime(record.checkIn)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {formatTime(record.checkOut)}
                     </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {calculateWorkingHours(record.checkIn, record.checkOut)}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.notes || ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
