import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Lock, BarChart3 } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState<"admin" | "manager" | "operator">("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("userRole", role);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${role}!`,
    });
    navigate(`/${role}`);
  };

  const roleCards = [
    {
      role: "admin" as const,
      title: "Administrator",
      icon: Lock,
      description: "Full system access and user management",
      color: "from-destructive to-destructive/80",
    },
    {
      role: "manager" as const,
      title: "Project Manager",
      icon: BarChart3,
      description: "Manage projects and allocate tasks",
      color: "from-primary to-accent",
    },
    {
      role: "operator" as const,
      title: "Operator",
      icon: Users,
      description: "Log work and update task status",
      color: "from-success to-success/80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            OpTrack Pro
          </h1>
          <p className="text-xl text-muted-foreground">
            Project Management & Operations Tracking System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Role Selection */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Select Your Role</h2>
            <div className="space-y-4">
              {roleCards.map((card) => {
                const Icon = card.icon;
                const isSelected = role === card.role;
                return (
                  <Card
                    key={card.role}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    onClick={() => setRole(card.role)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-3 bg-gradient-to-br ${card.color}`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login as {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Demo credentials: any email/password combination
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
