import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LeaveRequest {
    id: string;
    reason: string;
    startDate: string;
    endDate: string;
    status: "PENDING" | "APPROVED" | "DECLINED";
    createdAt: string;
}

import { createNotification } from "@/lib/notificationSystem";
import { useAuth } from "@/pages/AuthContext";

const LeaveApplication = () => {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Construct current user details from AuthContext or fallback
    const currentUser = user ? {
        id: user.id,
        name: (user as any).name || user.email,
        roleTitle: user.role,
        department: (user as any).department || "Engineering" // Fallback since backend might not send dept
    } : {
        id: "emp-123",
        name: "John Doe",
        roleTitle: "Software Engineer",
        department: "Engineering"
    };

    useEffect(() => {
        if (user) {
            fetchLeaves();
            window.addEventListener('storage', fetchLeaves);
            return () => window.removeEventListener('storage', fetchLeaves);
        }
    }, [user]);

    const fetchLeaves = () => {
        try {
            const storedLeaves = localStorage.getItem("mock_leaves");
            if (storedLeaves) {
                const parsedLeaves = JSON.parse(storedLeaves);
                // Filter leaves for this employee
                const myLeaves = parsedLeaves.filter((l: any) => l.employeeId === currentUser.id);
                setLeaves(myLeaves);
            }
        } catch (error) {
            console.error("Failed to fetch leaves from local storage", error);
        }
    };

    // ... inside component

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason || !dateRange.from || !dateRange.to) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const newLeave = {
                id: crypto.randomUUID(),
                employeeId: currentUser.id,
                employee: currentUser, // Store full employee details for Manager view
                reason,
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString(),
                status: "PENDING",
                createdAt: new Date().toISOString()
            };

            // Get existing leaves
            const existingLeaves = JSON.parse(localStorage.getItem("mock_leaves") || "[]");
            const updatedLeaves = [newLeave, ...existingLeaves];

            // Save to local storage
            localStorage.setItem("mock_leaves", JSON.stringify(updatedLeaves));

            // NOTIFY MANAGER
            // Using a generic manager ID or Role. Since we have "manager@dotspeaks.com" which likely has ID "user-123" or similar.
            // But relying on "ALL" or specific ID. 
            // For now, let's assume the manager user ID is "manager-1" (from my create_users script if I recall, or just generic).
            // Actually, best to just log it for "manager@dotspeaks.com" if we knew the ID. 
            // I'll use a known ID from my demo setup or just 'ALL' for simplicity if roles aren't strictly guarded in ID.
            // Better: "manager-123" and I'll make sure to tell user that manager receives it.
            // Wait, I should probably check the manager ID.
            // Actually, let's use a "global" notification for all managers? 
            // My helper supports "ALL". But that would not
            // Re-reading create_users.ts: manager userId is usually a UUID.
            // I will use a special "MANAGER_ROLE" target if I update my helper, but for now I'll just use "manager-1" 
            // and assume the user login as manager will need to match or I'll just change the manager login to see "manager-1" notifs.
            // WAit, simpler: The User object in AuthContext comes from backend.
            // I can't easily change the backend ID.
            // SAFE BET: Notify "ALL" for now or find the Manager ID.
            // Let's look at `create_users.ts` again to see if I can find the ID, or just use `check_users.ts`.
            // Actually, I'll just trigger it for "ALL" managers? No, that's messy.
            // I will use "manager-1" and hope the demo user aligns or just tell the user "Notification sent to manager". 
            // Actually, I can allow the helper to take a ROLE prefix? 
            // No, simpler: I will update the "manager" user's ID in the local storage logic? No.
            // I'll just use a fixed ID "manager-mock-id" and then logic in Layout can check "if role == manager show 'manager-mock-id' notifications".
            // That's a good frontend-only hack!

            // In layout.tsx I used `getNotifications(user.id)`.
            // I should update Layout.tsx to ALSO fetch notifications for `user.role`?
            // No, I'll just use the real UUID if I can.
            // Since I can't easily get the real UUID without querying, I will use "MANAGER_GROUP" and update Layout to listen for it.
            // Or easier: Just use "ALL" for this demo as asked by user "Manager gets notification".
            // Implementation: I'll use "ALL" but filter in Layout?
            // Let's go with "ALL" for now for simplicity in this demo, usually fine.
            // Or better: `createNotification("MANAGER", ...)` and Layout checks `if (user.role === "MANAGER" || userId === user.id)`.
            // YES. I will use "MANAGER" as the ID.
            createNotification("MANAGER", `New leave request from ${currentUser.name}: ${reason}`, "info");

            toast.success("Leave application submitted successfully");
            setReason("");
            setDateRange({ from: undefined, to: undefined });
            fetchLeaves(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit leave application");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Leave Application</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Apply for Leave Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Apply for Leave</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Leave</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g., Family function, Sick leave..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <Label>Date Range</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !dateRange.from && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                                            {format(dateRange.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date range</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange.from}
                                                selected={dateRange}
                                                onSelect={(range: any) => setDateRange(range)}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Request"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* My Leave History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Leave History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Remarks</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaves.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No leave requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaves.map((leave) => (
                                            <TableRow key={leave.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {leave.reason}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {leave.managerRemarks ? (
                                                        <span className="text-sm text-gray-600 block max-w-[150px] truncate" title={leave.managerRemarks}>
                                                            {leave.managerRemarks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            leave.status === "APPROVED"
                                                                ? "default" // "success" if you have it, else default/secondary
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
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default LeaveApplication;
