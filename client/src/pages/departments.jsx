import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";
import AddDepartmentModal from "@/components/modals/add-department-modal";
import EditDepartmentModal from "@/components/modals/edit-department-modal";
import { useAuthState } from "@/hooks/useAuth";
import DepartmentDetailModal from "@/components/modals/department-detail-modal";

export default function Departments() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();
  const { role } = useAuthState();
  const isHR = role === 'hr_manager';

  const { data: departmentsResponse, isLoading } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      // Use apiRequest helper which handles Vite proxy and auth headers automatically
      const data = await apiRequest('/departments');
      console.log('✅ Departments Response:', data);
      return data;
    },
  });

  const departments = departmentsResponse?.departments || [];
  const uniqueDepartments = Array.from(new Map((departments || []).map(d => [d.department_id, d])).values());
  

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id) => {
      // Use apiRequest helper which handles Vite proxy and auth headers automatically
      return await apiRequest(`/departments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Success",
        description: "Department deleted successfully",
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getDepartmentIcon = (departmentName) => {
    if (departmentName.toLowerCase().includes('it')) return 'fas fa-laptop-code text-blue-600';
    if (departmentName.toLowerCase().includes('hr')) return 'fas fa-users text-green-600';
    if (departmentName.toLowerCase().includes('finance')) return 'fas fa-chart-line text-yellow-600';
    return 'fas fa-building text-gray-600';
  };

  const getDepartmentIconBg = (departmentName) => {
    if (departmentName.toLowerCase().includes('it')) return 'bg-blue-100';
    if (departmentName.toLowerCase().includes('hr')) return 'bg-green-100';
    if (departmentName.toLowerCase().includes('finance')) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Department Management</h2>
        <Button 
          onClick={() => setShowAddModal(true)}
          className={`bg-primary text-white hover:bg-blue-600 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isHR}
          title={isHR ? 'Only Super Admin' : ''}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-building text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No departments found</p>
          </div>
        ) : (
          uniqueDepartments.map((department) => (
            <div key={`dept-${department.department_id}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${getDepartmentIconBg(department.department_name)} rounded-lg flex items-center justify-center`}>
                  <i className={`${getDepartmentIcon(department.department_name)} text-xl`}></i>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className={`text-primary hover:text-blue-600 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (isHR) return;
                      setSelectedDepartment(department);
                      setShowEditModal(true);
                    }}
                    disabled={isHR}
                    title={isHR ? 'Only Super Admin' : 'Edit department'}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className={`text-red-600 hover:text-red-800 disabled:opacity-50 ${isHR ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (isHR) return;
                      if (window.confirm(`Are you sure you want to delete ${department.department_name}? This action cannot be undone.`)) {
                        deleteDepartmentMutation.mutate(department.department_id);
                      }
                    }}
                    disabled={isHR || deleteDepartmentMutation.isPending}
                    title={isHR ? 'Only Super Admin' : (deleteDepartmentMutation.isPending ? "Deleting..." : "Delete department")}
                  >
                    {deleteDepartmentMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 max-w-[260px] truncate" title={department.department_name}>{department.department_name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg border px-3 py-2">
                  <div className="text-gray-500">Employees</div>
                  <div className="font-medium text-gray-800">{department.employeeCount || 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg border px-3 py-2">
                  <div className="text-gray-500">Manager</div>
                  <div className="font-medium text-gray-800 max-w-[180px] truncate" title={department.manager_name || 'N/A'}>{department.manager_name || 'N/A'}</div>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDepartment(department);
                    setShowDetailModal(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddDepartmentModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <EditDepartmentModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)}
          department={selectedDepartment}
        />
      )}

      {showDetailModal && (
        <DepartmentDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          department={selectedDepartment}
          employeesQueryKey={["/employees", selectedDepartment?.department_id, 100, 1]}
        />
      )}
    </div>
  );
}
