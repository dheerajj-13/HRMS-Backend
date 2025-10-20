import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Clock,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  role?: "admin" | "manager" | "operator";
}

export const Layout = ({ children, role }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const getNavItems = () => {
    if (!role) return [];

    const common = [
      { icon: LayoutDashboard, label: "Dashboard", path: `/${role}` },
    ];

    if (role === "admin") {
      return [
        ...common,
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: FolderKanban, label: "Projects", path: "/admin/projects" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
      ];
    }

    if (role === "manager") {
      return [
        ...common,
        { icon: FolderKanban, label: "Projects", path: "/manager/projects" },
        { icon: Users, label: "Team", path: "/manager/team" },
        { icon: FileText, label: "Reports", path: "/manager/reports" },
      ];
    }

    if (role === "operator") {
      return [
        ...common,
        { icon: Clock, label: "Worksheet", path: "/operator/worksheet" },
        { icon: FolderKanban, label: "My Tasks", path: "/operator/tasks" },
        { icon: FileText, label: "Reports", path: "/operator/reports" },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OpTrack Pro
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-border p-4">
            <div className="mb-3 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium capitalize">{role}</p>
              <p className="text-xs text-muted-foreground">
                demo@optrack.com
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
