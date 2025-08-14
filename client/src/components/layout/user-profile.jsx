import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useLogout } from "@/hooks/useAuth";

export default function UserProfile() {
  const { data, isLoading } = useAuth();
  const logout = useLogout();
  
  // Lấy thông tin user từ data
  const user = data?.user;
  
  // Nếu đang loading hoặc chưa có user
  if (isLoading || !user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">Loading...</div>
          <div className="text-xs text-gray-500">Đang tải...</div>
        </div>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">U</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Thông tin user */}
      <div className="text-right">
        <div className="text-sm font-medium text-gray-700">
          {user.fullName || "Unknown User"}
        </div>
        <div className="text-xs text-gray-500">
          {user.email || "no-email@example.com"}
        </div>
        <div className="text-xs text-blue-600 font-medium capitalize">
          {user.role ? user.role.replace('_', ' ') : "Unknown"}
        </div>
      </div>
      
      {/* Avatar và dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-10 h-10 bg-primary rounded-full p-0 hover:bg-primary/90">
            <span className="text-white font-medium">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="flex items-center space-x-2">
            <i className="fas fa-user w-4"></i>
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center space-x-2">
            <i className="fas fa-cog w-4"></i>
            <span>Cài đặt</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center space-x-2 text-red-600"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <i className="fas fa-sign-out-alt w-4"></i>
            <span>{logout.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
