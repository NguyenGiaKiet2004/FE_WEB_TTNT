import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-config";

export default function DepartmentDetailModal({ isOpen, onClose, department, employeesQueryKey, employees = [] }) {
  if (!department) return null;

  const deptId = parseInt(department.department_id, 10);
  const base = Number.isFinite(deptId) ? deptId * 10000 : NaN;

  const { data: fetchedEmployees } = useQuery({
    queryKey: employeesQueryKey || [],
    queryFn: async () => {
      if (!employeesQueryKey || !employeesQueryKey[0] || !department?.department_id) {
        return { employees: [] };
      }
      const [endpoint, departmentId, limit, page] = employeesQueryKey;
      const data = await apiRequest(`${endpoint}?departmentId=${departmentId}&limit=${limit}&page=${page}`);
      return data;
    },
    enabled: !!(employeesQueryKey && employeesQueryKey[0] && department?.department_id),
  });

  const effectiveEmployees = (fetchedEmployees?.employees || employees || []);

  const parsedEmployees = effectiveEmployees.map((e) => ({
    ...e,
    _empIdNum: (() => {
      const n = parseInt(String(e.employee_id || "").trim(), 10);
      return Number.isNaN(n) ? null : n;
    })(),
  }));

  const manager = parsedEmployees.find((e) => e._empIdNum === base) || null;
  const members = parsedEmployees.filter((e) => {
    if (e._empIdNum == null) return false;
    if (!Number.isFinite(base)) return false;
    if (e._empIdNum <= base || e._empIdNum > base + 9999) return false;
    return true;
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Department Detail — {department.department_name}
          </DialogTitle>
          <DialogDescription>Employees and manager for this department.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Department ID</div>
                <div className="font-medium text-gray-800">{department.department_id}</div>
              </div>
              <div>
                <div className="text-gray-500">Created At</div>
                <div className="font-medium text-gray-800">{department.created_at ? new Date(department.created_at).toLocaleString() : "N/A"}</div>
              </div>
              <div>
                <div className="text-gray-500">Employees</div>
                <div className="font-medium text-gray-800">{parsedEmployees.length}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-500">Manager</div>
            <div className="bg-white rounded-lg border p-4">
              {manager ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{manager.name || manager.fullName}</div>
                    <div className="text-xs text-gray-500">Mã NV: {manager.user_id} | Employee ID: {manager.employee_id}</div>
                  </div>
                  <Badge>Manager</Badge>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Chưa thiết lập trưởng phòng</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-500">Members</div>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No members</td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.id} className="border-b last:border-b-0">
                          <td className="px-4 py-2 text-sm text-gray-900 max-w-[220px] truncate" title={m.name || m.fullName}>
                            {m.name || m.fullName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{m.user_id || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{m.employee_id || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 max-w-[220px] truncate" title={m.email}>
                            {m.email || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{m.role?.name || m.role || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Debug: Show all employees - Commented out for production */}
          {/* <div className="space-y-2">
            <div className="text-sm text-gray-500">All Employees (Debug)</div>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No employees</td>
                      </tr>
                    ) : (
                      parsedEmployees.map((e) => {
                        const isManager = e._empIdNum === base;
                        const isMember = e._empIdNum > base && e._empIdNum <= base + 9999;
                        const type = isManager ? 'Manager' : (isMember ? 'Member' : 'Other');
                        
                        return (
                          <tr key={e.id} className="border-b last:border-b-0">
                            <td className="px-4 py-2 text-sm text-gray-900 max-w-[200px] truncate" title={e.name || e.fullName}>
                              {e.name || e.fullName}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.user_id || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.employee_id || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 max-w-[150px] truncate" title={e.email}>
                              {e.email || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.role?.name || e.role || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              <span className={`px-2 py-1 rounded text-xs ${
                                type === 'Manager' ? 'bg-purple-100 text-purple-800' :
                                type === 'Member' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {type}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}


