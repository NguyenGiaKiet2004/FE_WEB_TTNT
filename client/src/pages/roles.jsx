import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditRoleModal from "@/components/modals/edit-role-modal";

export default function Roles() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: ""
  });
  const { toast } = useToast();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      setShowAddModal(false);
      setFormData({ name: "", description: "", departmentId: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.departmentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (rolesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
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

  const rolesWithDepartments = roles.map(role => ({
    ...role,
    department: departments.find(dept => dept.id === role.departmentId)
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Role Management</h2>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white hover:bg-blue-600"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rolesWithDepartments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                rolesWithDepartments.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{role.department?.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {role.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="text-primary hover:text-blue-600"
                        onClick={() => {
                          setSelectedRole(role);
                          setShowEditModal(true);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteRoleMutation.mutate(role.id)}
                        disabled={deleteRoleMutation.isPending}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.departmentId} onValueChange={(value) => handleInputChange("departmentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRoleMutation.isPending}
                className="bg-primary hover:bg-blue-600"
              >
                {createRoleMutation.isPending ? "Adding..." : "Add Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showEditModal && (
        <EditRoleModal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)}
          role={selectedRole}
          departments={departments}
        />
      )}
    </div>
  );
}
