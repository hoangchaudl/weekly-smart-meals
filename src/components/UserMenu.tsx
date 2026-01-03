import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react"; // Consistent icons

export function UserMenu() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Safely access user metadata
  const profile = session?.user?.user_metadata;
  const email = session?.user?.email;

  // Generate initials (e.g. "CD" for Chau Dinh)
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0].toUpperCase() || "U";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm bg-secondary">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="right"
        className="w-56 ml-2"
        sideOffset={10}
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate font-normal">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Account Info</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
