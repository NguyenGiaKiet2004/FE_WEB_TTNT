import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EditRoleModal({ isOpen, onClose, role, departments }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: ""
  });

  // Update form data when role prop changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        description: role.description || "",
        departmentId: role.departmentId || ""
      });
    }
  }, [role]);

  const updateRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Role updated successfully",
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
        description: "Please fill in role name",
        variant: "destructive",
      });
      return;
    }

    updateRoleMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateRoleMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
