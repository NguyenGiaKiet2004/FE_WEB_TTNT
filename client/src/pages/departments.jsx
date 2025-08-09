import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddDepartmentModal from "@/components/modals/add-department-modal";
import EditDepartmentModal from "@/components/modals/edit-department-modal";

export default function Departments() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { toast } = useToast();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["/api/departments"],
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete department");
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
          className="bg-primary text-white hover:bg-blue-600"
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
          departments.map((department) => (
            <div key={department.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${getDepartmentIconBg(department.name)} rounded-lg flex items-center justify-center`}>
                  <i className={`${getDepartmentIcon(department.name)} text-xl`}></i>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-primary hover:text-blue-600"
                    onClick={() => {
                      setSelectedDepartment(department);
                      setShowEditModal(true);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteDepartmentMutation.mutate(department.id)}
                    disabled={deleteDepartmentMutation.isPending}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{department.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{department.description || "No description available"}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Employees: <span className="font-medium text-gray-700">{department.employeeCount || 0}</span>
                </span>
                <span className="text-gray-500">
                  Manager: <span className="font-medium text-gray-700">{department.manager || "N/A"}</span>
                </span>
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
    </div>
  );
}
