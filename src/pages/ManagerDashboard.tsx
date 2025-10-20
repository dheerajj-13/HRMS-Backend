import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  MoreVertical,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ManagerDashboard() {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      status: "In Progress",
      progress: 65,
      team: 5,
      deadline: "2024-11-15",
      hoursAllocated: 120,
      hoursUsed: 78,
    },
    {
      id: 2,
      name: "Mobile App Development",
      status: "In Progress",
      progress: 45,
      team: 8,
      deadline: "2024-12-01",
      hoursAllocated: 200,
      hoursUsed: 90,
    },
    {
      id: 3,
      name: "Database Migration",
      status: "Pending",
      progress: 10,
      team: 3,
      deadline: "2024-11-20",
      hoursAllocated: 80,
      hoursUsed: 8,
    },
  ];

  const teamMembers = [
    { name: "John Doe", tasksCompleted: 12, hoursLogged: 72, status: "Active" },
    { name: "Sarah Johnson", tasksCompleted: 15, hoursLogged: 81, status: "Active" },
    { name: "Mike Davis", tasksCompleted: 8, hoursLogged: 54, status: "On Leave" },
    { name: "Emily Chen", tasksCompleted: 10, hoursLogged: 63, status: "Active" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "warning";
      case "Completed":
        return "success";
      case "Pending":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Layout role="manager">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Project Manager Dashboard</h1>
            <p className="text-muted-foreground">
              Manage projects, allocate tasks, and track team performance
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Projects"
            value="12"
            icon={FolderKanban}
            trend="+2 this month"
            trendUp={true}
            color="primary"
          />
          <StatsCard
            title="Team Members"
            value="24"
            icon={Users}
            trend="4 active today"
            trendUp={true}
            color="success"
          />
          <StatsCard
            title="Hours Allocated"
            value="1,840"
            icon={Clock}
            trend="68% utilized"
            trendUp={true}
            color="warning"
          />
          <StatsCard
            title="Tasks Completed"
            value="156"
            icon={CheckCircle2}
            trend="+18 this week"
            trendUp={true}
            color="success"
          />
        </div>

        {/* Projects */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Active Projects</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{project.name}</h4>
                      <Badge variant={getStatusColor(project.status) as any}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.team} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.hoursUsed}/{project.hoursAllocated} hours
                      </span>
                      <span>Due: {project.deadline}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Tasks Completed</th>
                  <th className="text-left py-3 px-4 font-medium">Hours Logged</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="py-3 px-4">{member.tasksCompleted}</td>
                    <td className="py-3 px-4">{member.hoursLogged}h</td>
                    <td className="py-3 px-4">
                      <Badge variant={member.status === "Active" ? "success" : "default" as any}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
