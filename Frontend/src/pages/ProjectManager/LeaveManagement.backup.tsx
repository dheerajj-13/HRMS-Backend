import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Employee {
    name: string;
    roleTitle: string;
    department: string;
}

interface LeaveRequest {
    id: string;
    employee: Employee;
    reason: string;
    startDate: string;
    endDate: string;
    status: "PENDING" | "APPROVED" | "DECLINED";
    createdAt: string;
}

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaves();
        // Listen for storage changes in case employee tab updates it (optional polish)
        window.addEventListener('storage', fetchLeaves);
        return () => window.removeEventListener('storage', fetchLeaves);
    }, []);

    const fetchLeaves = () => {
        setLoading(true);
        try {
            let storedLeaves = localStorage.getItem("mock_leaves");

            // SEED DEMO DATA IF EMPTY
            if (!storedLeaves || JSON.parse(storedLeaves).length === 0) {
                const demoLeave = {
                    id: "demo-leave-1",
                    employeeId: "emp-123",
                    employee: {
                        name: "John Doe",
                        roleTitle: "Software Engineer",
                        department: "Engineering"
                    },
                    reason: "Family Vacation (Demo)",
                    startDate: new Date().toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
                    status: "PENDING",
                    createdAt: new Date().toISOString()
                };
                const initialData = [demoLeave];
                localStorage.setItem("mock_leaves", JSON.stringify(initialData));
                storedLeaves = JSON.stringify(initialData);
            }

            if (storedLeaves) {
                setLeaves(JSON.parse(storedLeaves));
            } else {
                setLeaves([]);
            }
        } catch (error) {
            console.error("Failed to fetch leaves", error);
            toast.error("Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: "APPROVED" | "DECLINED") => {
        try {
            // Get current leaves
            const text = localStorage.getItem("mock_leaves");
            if (!text) return;

            const currentLeaves = JSON.parse(text);
            const updatedLeaves = currentLeaves.map((leave: any) => {
                if (leave.id === id) {
                    return { ...leave, status };
                }
                return leave;
            });

            // Save back
            localStorage.setItem("mock_leaves", JSON.stringify(updatedLeaves));

            toast.success(`Leave request ${status.toLowerCase()}`);
            fetchLeaves(); // Refresh UI
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            No leave requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaves.map((leave) => (
                                        <TableRow key={leave.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{leave.employee?.name || "Unknown"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {leave.employee?.roleTitle} • {leave.employee?.department}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <p className="truncate" title={leave.reason}>{leave.reason}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>From: {format(new Date(leave.startDate), "MMM d, yyyy")}</span>
                                                    <span>To: {format(new Date(leave.endDate), "MMM d, yyyy")}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        leave.status === "APPROVED"
                                                            ? "default"
                                                            : leave.status === "DECLINED"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                    className={
                                                        leave.status === "APPROVED" ? "bg-green-500 hover:bg-green-600" : ""
                                                    }
                                                >
                                                    {leave.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {leave.status === "PENDING" && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                            onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleStatusUpdate(leave.id, "DECLINED")}
                                                            title="Decline"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default LeaveManagement;
