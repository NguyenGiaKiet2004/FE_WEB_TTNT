import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EditDepartmentModal({ isOpen, onClose, department }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: ""
  });

  // Update form data when department prop changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
        manager: department.manager || ""
      });
    }
  }, [department]);

  const updateDepartmentMutation = useMutation({
    mutationFn: async (departmentData) => {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departmentData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update department");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Department updated successfully",
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
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please fill in department name",
        variant: "destructive",
      });
      return;
    }

    updateDepartmentMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
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
          
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => handleInputChange("manager", e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateDepartmentMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {updateDepartmentMutation.isPending ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
