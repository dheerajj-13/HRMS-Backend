import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Play,
  Pause,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OperatorDashboard() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const { toast } = useToast();

  const tasks = [
    {
      id: 1,
      name: "Homepage UI Development",
      project: "Website Redesign",
      status: "In Progress",
      hoursAllocated: 8,
      hoursUsed: 5.5,
      deadline: "2024-10-25",
    },
    {
      id: 2,
      name: "API Integration",
      project: "Mobile App",
      status: "Pending",
      hoursAllocated: 12,
      hoursUsed: 0,
      deadline: "2024-10-28",
    },
    {
      id: 3,
      name: "Database Schema Design",
      project: "Database Migration",
      status: "Completed",
      hoursAllocated: 6,
      hoursUsed: 6,
      deadline: "2024-10-22",
    },
  ];

  const todayWorksheet = [
    { hour: "09:00 - 10:00", task: "Homepage UI Development", status: "Completed" },
    { hour: "10:00 - 11:00", task: "Homepage UI Development", status: "Completed" },
    { hour: "11:00 - 12:00", task: "Code Review", status: "Completed" },
    { hour: "12:00 - 13:00", task: "Lunch Break", status: "Break" },
    { hour: "13:00 - 14:00", task: "API Integration", status: "In Progress" },
    { hour: "14:00 - 15:00", task: "Not Started", status: "Pending" },
    { hour: "15:00 - 16:00", task: "Not Started", status: "Pending" },
    { hour: "16:00 - 17:00", task: "Not Started", status: "Pending" },
    { hour: "17:00 - 18:00", task: "Not Started", status: "Pending" },
  ];

  const handleStartTimer = () => {
    if (!currentTask) {
      toast({
        title: "Select a task",
        description: "Please select a task before starting the timer",
        variant: "destructive",
      });
      return;
    }
    setIsTimerRunning(true);
    toast({
      title: "Timer Started",
      description: `Working on: ${currentTask}`,
    });
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    toast({
      title: "Timer Stopped",
      description: "Time logged successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "warning";
      case "Break":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Layout role="operator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Operator Dashboard</h1>
          <p className="text-muted-foreground">
            Track your work, log hours, and update task status
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Today's Hours"
            value="5.5"
            icon={Clock}
            trend="3.5h remaining"
            trendUp={true}
            color="primary"
          />
          <StatsCard
            title="Active Tasks"
            value="3"
            icon={AlertCircle}
            trend="1 in progress"
            trendUp={true}
            color="warning"
          />
          <StatsCard
            title="Completed Tasks"
            value="12"
            icon={CheckCircle2}
            trend="This week"
            trendUp={true}
            color="success"
          />
          <StatsCard
            title="Reports Submitted"
            value="8"
            icon={FileText}
            trend="This month"
            trendUp={true}
            color="primary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Time Tracker */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Time Tracker</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Task</Label>
                <Select value={currentTask} onValueChange={setCurrentTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.name}>
                        {task.name} - {task.project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4 font-mono">
                    {isTimerRunning ? "01:23:45" : "00:00:00"}
                  </div>
                  {isTimerRunning ? (
                    <Button
                      size="lg"
                      variant="destructive"
                      className="gap-2"
                      onClick={handleStopTimer}
                    >
                      <Pause className="h-5 w-5" />
                      Stop Timer
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={handleStartTimer}
                    >
                      <Play className="h-5 w-5" />
                      Start Timer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Update */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Quick Status Update</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task to update" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Add any remarks or notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Report (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button className="w-full" variant="success">
                Update Status
              </Button>
            </div>
          </Card>
        </div>

        {/* Today's Worksheet */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Today's Worksheet (9 Hours)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Time Slot</th>
                  <th className="text-left py-3 px-4 font-medium">Task</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayWorksheet.map((slot, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{slot.hour}</td>
                    <td className="py-3 px-4">{slot.task}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusColor(slot.status) as any}>
                        {slot.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* My Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">My Assigned Tasks</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{task.name}</h4>
                      <Badge variant={getStatusColor(task.status) as any}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{task.project}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {task.hoursUsed}/{task.hoursAllocated} hours
                      </span>
                      <span>Due: {task.deadline}</span>
                    </div>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
