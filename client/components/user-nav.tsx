"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Settings } from "lucide-react";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  const loadUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  };

  useEffect(() => {
    loadUser(); // Initial load

    // --- FIX: Custom Event Listener ---
    const handleUserUpdate = () => loadUser();

    // Custom event "userDataUpdated" ko suno
    window.addEventListener("userDataUpdated", handleUserUpdate);
    // Storage event bhi rakhte hain taaki multi-tab sync rahe
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userDataUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U"
    );
  };

  const renderAvatar = (className: string) => (
    <Avatar className={className}>
      <AvatarImage
        src={user?.avatar && user.avatar.length > 10 ? user.avatar : ""}
        alt={user?.name}
        className="object-cover"
      />
      <AvatarFallback className="font-bold bg-primary/10 text-primary">
        {user ? getInitials(user.name) : "U"}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {renderAvatar(
            "h-9 w-9 border-2 border-muted transition-all hover:border-primary/50"
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <div className="flex items-center gap-3 p-2">
          {renderAvatar("h-10 w-10 border border-border")}
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold leading-none truncate max-w-[150px]">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2.5"
            onClick={() => router.push("/dashboard/settings")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Profile</span>
              <span className="text-[10px] text-muted-foreground">
                Manage your account
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2.5"
            onClick={() => router.push("/dashboard/settings")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Preferences</span>
              <span className="text-[10px] text-muted-foreground">
                Theme & currency
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 py-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
