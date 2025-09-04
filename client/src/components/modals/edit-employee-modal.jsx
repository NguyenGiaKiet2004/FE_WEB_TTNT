import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";

export default function EditEmployeeModal({ isOpen, onClose, employee, departments, roles }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    departmentId: "", // store department name for backend
    departmentSelectValue: "", // UI select raw value `${id}|${name}`
    roleId: "",
    status: "active",
    faceImages: []
  });

  // Update form data when employee prop changes
  useEffect(() => {
    if (employee) {
      const deptName = employee.department?.name || "";
      const match = (departments || []).find(d => d.department_name === deptName);
      setFormData(prev => ({
        ...prev,
        name: employee.name || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        address: employee.address || "",
        departmentId: deptName,
        departmentSelectValue: match ? `${match.department_id}|${match.department_name}` : "",
        roleId: employee.role?.name || "",
        status: employee.status || "active",
        faceImages: employee.faceImages || []
      }));
    }
  }, [employee, departments]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (employeeData) => {
      return await apiRequest(`/employees/${employee.id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      onClose();
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
    
    if (!formData.name || !formData.email || !formData.departmentId || !formData.roleId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateEmployeeMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uniqueDepartments = Array.from(new Map((departments || []).map(d => [d.department_id, d])).values());

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Edit employee details.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            {/* Employee ID removed - backend auto-assigns when department/role change */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="departmentSelect">Department *</Label>
              <Select id="departmentSelect" value={formData.departmentSelectValue} onValueChange={(value) => {
                const parts = String(value).split('|');
                const name = parts.length > 1 ? parts.slice(1).join('|') : value;
                setFormData(prev => ({ ...prev, departmentId: name, departmentSelectValue: value }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department">{formData.departmentId || undefined}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={`dept-${dept.department_id}`} value={`${dept.department_id}|${dept.department_name}`}>{dept.department_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roleSelect">Role *</Label>
              <Select id="roleSelect" value={formData.roleId} onValueChange={(value) => handleInputChange("roleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={`role-${role.id}`} value={role.name}>{role.name}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusSelect">Status</Label>
              <Select id="statusSelect" value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateEmployeeMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {updateEmployeeMutation.isPending ? "Updating..." : "Update Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
