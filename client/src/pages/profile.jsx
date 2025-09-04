import { useAuthState } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        No user data available
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top banner with avatar */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200">
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
        <div className="p-6 bg-white">
          <div className="flex items-end justify-between -mt-20">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {(user.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 break-words max-w-[600px] truncate" title={user.fullName || user.name}>{user.fullName || user.name || "N/A"}</div>
                <div className="text-sm text-gray-500 break-words max-w-[600px] truncate" title={user.email}>{user.email || "N/A"}</div>
                <div className="text-sm text-blue-600 font-medium capitalize mt-1">{user.role || "N/A"}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline"><i className="fas fa-download mr-2" />Export</Button>
              <Button className="bg-primary text-white"><i className="fas fa-edit mr-2" />Edit</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department</CardTitle>
            <CardDescription>Where you belong</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">{user.departmentName || user.department?.name || "Unassigned"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phone number</CardTitle>
            <CardDescription>Contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">{user.phoneNumber || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
            <CardDescription>Mailing address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 break-words">{user.address || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee ID</CardTitle>
            <CardDescription>Internal identifier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">{user.employeeId || user.employee_id || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Joined</CardTitle>
            <CardDescription>Account creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email</CardTitle>
            <CardDescription>Primary login</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 break-words">{user.email || "N/A"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


