import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AddEmployeeModal({ isOpen, onClose, departments, roles }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    departmentId: "",
    roleId: "",
    status: "active",
    faceImages: []
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create employee");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      onClose();
      setFormData({
        name: "",
        employeeId: "",
        email: "",
        phone: "",
        departmentId: "",
        roleId: "",
        status: "active",
        faceImages: []
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
    
    if (!formData.name || !formData.employeeId || !formData.email || !formData.departmentId || !formData.roleId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createEmployeeMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                required
              />
            </div>
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
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
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
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.roleId} onValueChange={(value) => handleInputChange("roleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Face Images Upload */}
          <div>
            <Label>Face Recognition Images *</Label>
            <p className="text-sm text-gray-500 mb-4">Upload at least 2 clear face images for accurate recognition</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 mb-2">Drag and drop images here or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Handle file upload logic here
                  const files = Array.from(e.target.files);
                  console.log("Files selected:", files);
                }}
              />
              <Button type="button" variant="outline">Choose Files</Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployeeMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
