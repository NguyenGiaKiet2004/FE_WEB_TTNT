import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";

export default function EditDepartmentModal({ isOpen, onClose, department }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: ""
  });

  // Update form data when department prop changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.department_name || ""
      });
    }
  }, [department]);

  const updateDepartmentMutation = useMutation({
    mutationFn: async (departmentData) => {
      // Backend expects: department_name only (no description column in database)
      const backendData = {
        department_name: departmentData.name
      };
      
      console.log('🔧 Updating department:', department.department_id, 'with data:', backendData);
      
      // Use apiRequest helper which handles Vite proxy and auth headers automatically
      return await apiRequest(`/departments/${department.department_id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });
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
