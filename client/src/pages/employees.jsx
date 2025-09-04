import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";
import AddEmployeeModal from "@/components/modals/add-employee-modal";
import EditEmployeeModal from "@/components/modals/edit-employee-modal";
import { useAuthState } from "@/hooks/useAuth";

export default function Employees() {
  const { toast } = useToast();
  const { role } = useAuthState();
  const isHR = role === 'hr_manager';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ["/api/employees", currentPage, pageSize],
    queryFn: async () => {
      const data = await apiRequest(`/employees?page=${currentPage}&limit=${pageSize}`);
      console.log('✅ Employees Response:', data);
      return data;
    },
  });

  const employees = employeesResponse?.employees || [];
  const pagination = employeesResponse?.pagination || {};

  const { data: departmentsResponse } = useQuery({
    queryKey: ["/api/departments"],
  });
  const departments = departmentsResponse?.departments || [];
  const uniqueDepartments = Array.from(new Map((departments || []).map(d => [d.department_id, d])).values());

  const { data: roles = [] } = useQuery({
    queryKey: ["/api/roles"],
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id) => {
      // Use apiRequest helper which handles Vite proxy and auth headers automatically
      return await apiRequest(`/employees/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Reset to first page if current page becomes empty after deletion
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, roleFilter, statusFilter]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
                             employee.department?.name === departmentFilter;
    
    const matchesRole = roleFilter === "all" || 
                       employee.role?.name === roleFilter;
    
    const matchesStatus = statusFilter === "all" || 
                         employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
        <h2 className="text-xl font-semibold text-gray-800">Employee Management</h2>
        <Button 
          onClick={() => setShowAddModal(true)}
          className={`bg-primary text-white hover:bg-blue-600 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isHR}
          title={isHR ? 'Only Super Admin' : ''}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="dept-all" value="all">All Departments</SelectItem>
              {uniqueDepartments.map(dept => (
                <SelectItem key={`dept-${dept.department_id}`} value={dept.department_name}>{dept.department_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={`role-${role.id}`} value={role.name}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face Images</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-[220px] truncate" title={employee.name}>{employee.name}</div>
                          <div className="text-sm text-gray-500 max-w-[260px] truncate" title={employee.email}>{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employee_id || employee.employeeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.role?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[260px] truncate" title={employee.address || 'N/A'}>
                      {employee.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {employee.faceImages?.length > 0 ? (
                          employee.faceImages.slice(0, 2).map((_, index) => (
                            <div key={index} className="w-8 h-8 bg-gray-300 rounded border"></div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No images</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className={`text-primary hover:text-blue-600 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (isHR) return;
                          setSelectedEmployee(employee);
                          setShowEditModal(true);
                        }}
                        disabled={isHR}
                        title={isHR ? 'Only Super Admin' : 'Edit employee'}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className={`text-red-600 hover:text-red-800 disabled:opacity-50 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (isHR) return;
                          if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
                            deleteEmployeeMutation.mutate(employee.id);
                          }
                        }}
                        disabled={isHR || deleteEmployeeMutation.isPending}
                        title={isHR ? 'Only Super Admin' : (deleteEmployeeMutation.isPending ? "Deleting..." : "Delete employee")}
                      >
                        {deleteEmployeeMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} employees
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev || currentPage === 1}
              className="px-3 py-1"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="px-3 py-1 min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages || 1, prev + 1))}
              disabled={!pagination.hasNext || currentPage === (pagination.totalPages || 1)}
              className="px-3 py-1"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          departments={departments}
          roles={roles}
        />
      )}

      {showEditModal && (
        <EditEmployeeModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)}
          employee={selectedEmployee}
          departments={departments}
          roles={roles}
        />
      )}
    </div>
  );
}
