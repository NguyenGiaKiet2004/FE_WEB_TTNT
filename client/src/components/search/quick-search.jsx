import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [, setLocation] = useLocation();

  // Fetch data for search
  const { data: employeesResponse } = useQuery({
    queryKey: ["/api/employees"],
  });
  const employees = employeesResponse?.employees || [];

  const { data: departmentsResponse } = useQuery({
    queryKey: ["/api/departments"],
  });
  const departments = departmentsResponse?.departments || [];

  const { data: rolesResponse } = useQuery({
    queryKey: ["/api/roles"],
  });
  const roles = rolesResponse || [];

  // Keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter results based on search value
  const getFilteredResults = () => {
    const query = searchValue.toLowerCase();
    if (!query) return [];

    const results = [];

    // Debug logging
    console.log('🔍 QuickSearch Debug:', {
      employees: employees,
      employeesType: typeof employees,
      isArray: Array.isArray(employees),
      departments: departments,
      roles: roles
    });

    // Ensure employees is an array
    const employeesArray = Array.isArray(employees) ? employees : [];
    
    // Employees
    const filteredEmployees = employeesArray.filter(emp => 
      emp.fullName?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      String(emp.employeeId || "").toLowerCase().includes(query)
    );

    if (filteredEmployees.length > 0) {
      results.push({
        type: "employees",
        title: "Employees",
        items: filteredEmployees.slice(0, 5).map(emp => ({
          id: emp.id,
          title: emp.fullName,
          subtitle: emp.email,
          description: `Employee ID: ${emp.employeeId}`,
          icon: "fas fa-user",
          action: () => setLocation(`/employees`),
          badge: emp.status
        }))
      });
    }

    // Ensure departments is an array
    const departmentsArray = Array.isArray(departments) ? departments : [];
    
    // Departments
    const filteredDepartments = departmentsArray.filter(dept => 
      dept.department_name?.toLowerCase().includes(query)
    );

    if (filteredDepartments.length > 0) {
      results.push({
        type: "departments",
        title: "Departments",
        items: filteredDepartments.slice(0, 3).map(dept => ({
          id: dept.department_id,
          title: dept.department_name,
          subtitle: "Department",
          description: `#${dept.department_id}`,
          icon: "fas fa-building",
          action: () => setLocation(`/departments`),
          badge: null
        }))
      });
    }

    // Ensure roles is an array
    const rolesArray = Array.isArray(roles) ? roles : [];
    
    // Roles
    const filteredRoles = rolesArray.filter(role => 
      role.name?.toLowerCase().includes(query)
    );

    if (filteredRoles.length > 0) {
      results.push({
        type: "roles",
        title: "Roles",
        items: filteredRoles.slice(0, 3).map(role => ({
          id: role.id,
          title: role.name,
          subtitle: role.description || "No description",
          description: role.department?.name || "No department",
          icon: "fas fa-user-tag",
          action: () => setLocation(`/roles`),
          badge: null
        }))
      });
    }

    // Quick Actions
    const quickActions = [
      {
        id: "add-employee",
        title: "Add Employee",
        subtitle: "Create new employee",
        description: "Navigate to employee creation",
        icon: "fas fa-user-plus",
        action: () => setLocation(`/employees`),
        badge: "Action"
      },
      {
        id: "add-department",
        title: "Create Department",
        subtitle: "Create new department",
        description: "Navigate to department creation",
        icon: "fas fa-building",
        action: () => setLocation(`/departments`),
        badge: "Action"
      },
      {
        id: "add-role",
        title: "Create Role",
        subtitle: "Create new role",
        description: "Navigate to role creation",
        icon: "fas fa-user-tag",
        action: () => setLocation(`/roles`),
        badge: "Action"
      }
    ];

    if (query.includes("add") || query.includes("create") || query.includes("new")) {
      results.push({
        type: "actions",
        title: "Quick Actions",
        items: quickActions
      });
    }

    return results;
  };

  const results = getFilteredResults();

  return (
    <>
      <Button
        variant="outline"
        className="relative w-64 justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <i className="fas fa-search mr-2 h-4 w-4" />
        <span>Quick Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Quick Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for employees, departments, roles, and quick actions
        </DialogDescription>
        <Command>
          <CommandInput 
            placeholder="Search employees, departments, roles..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {results.map((group) => (
              <CommandGroup key={group.type} heading={group.title}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      item.action();
                      setOpen(false);
                      setSearchValue("");
                    }}
                    className="flex items-center space-x-3 p-3"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className={`${item.icon} text-gray-600`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant={item.badge === "Action" ? "default" : "secondary"} className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{item.subtitle}</div>
                        <div className="text-xs text-gray-400 truncate">{item.description}</div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
