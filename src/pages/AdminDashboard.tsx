import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const projectData = [
    { name: "Jan", projects: 12 },
    { name: "Feb", projects: 19 },
    { name: "Mar", projects: 15 },
    { name: "Apr", projects: 25 },
    { name: "May", projects: 22 },
    { name: "Jun", projects: 30 },
  ];

  const statusData = [
    { name: "Completed", value: 45, color: "hsl(var(--success))" },
    { name: "In Progress", value: 30, color: "hsl(var(--warning))" },
    { name: "Pending", value: 15, color: "hsl(var(--primary))" },
    { name: "On Hold", value: 10, color: "hsl(var(--destructive))" },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New project created",
      project: "Website Redesign",
      user: "John Smith",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Task completed",
      project: "Mobile App",
      user: "Sarah Johnson",
      time: "4 hours ago",
    },
    {
      id: 3,
      action: "Report submitted",
      project: "Database Migration",
      user: "Mike Davis",
      time: "6 hours ago",
    },
  ];

  return (
    <Layout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of system operations and metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value="247"
            icon={Users}
            trend="+12% from last month"
            trendUp={true}
            color="primary"
          />
          <StatsCard
            title="Active Projects"
            value="38"
            icon={FolderKanban}
            trend="+5 new this week"
            trendUp={true}
            color="success"
          />
          <StatsCard
            title="Completed Tasks"
            value="1,234"
            icon={CheckCircle2}
            trend="+23% completion rate"
            trendUp={true}
            color="success"
          />
          <StatsCard
            title="Pending Issues"
            value="12"
            icon={AlertCircle}
            trend="-3 from yesterday"
            trendUp={true}
            color="warning"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Project Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Project Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button variant="outline">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.project} • {activity.user}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
