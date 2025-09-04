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
  
  // Get user info from data
  const user = data?.user;
  
  // If loading or user not available
  if (isLoading || !user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">Loading...</div>
          <div className="text-xs text-gray-500">Fetching...</div>
        </div>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">U</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* User info */}
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
      
      {/* Avatar & dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-10 h-10 bg-primary rounded-full p-0 hover:bg-primary/90">
            <span className="text-white font-medium">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="flex items-center space-x-2" onClick={() => window.location.assign('/profile')}>
            <i className="fas fa-user w-4"></i>
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center space-x-2">
            <i className="fas fa-cog w-4"></i>
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center space-x-2 text-red-600"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <i className="fas fa-sign-out-alt w-4"></i>
            <span>{logout.isPending ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
