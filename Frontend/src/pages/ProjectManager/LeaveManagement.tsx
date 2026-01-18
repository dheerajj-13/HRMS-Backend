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
import { Check, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists as seen in LeaveApplication
import { Label } from "@/components/ui/label";

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
    managerRemarks?: string; // Added field
}

import { createNotification } from "@/lib/notificationSystem";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "DECLINED">("ALL");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    // Derived Filtered Data
    const filteredLeaves = leaves.filter(leave => {
        const matchesName = (leave.employee?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || leave.status === statusFilter;

        let matchesDate = true;
        if (dateFilter) {
            const checkDate = new Date(dateFilter).setHours(0, 0, 0, 0);
            const start = new Date(leave.startDate).setHours(0, 0, 0, 0);
            const end = new Date(leave.endDate).setHours(0, 0, 0, 0);
            // Check if selected date falls within the leave range
            matchesDate = checkDate >= start && checkDate <= end;
        }

        return matchesName && matchesStatus && matchesDate;
    });

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"APPROVED" | "DECLINED" | null>(null);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        fetchLeaves();
        window.addEventListener('storage', fetchLeaves);
        return () => window.removeEventListener('storage', fetchLeaves);
    }, []);

    const fetchLeaves = () => {
        setLoading(true);
        try {
            let storedLeaves = localStorage.getItem("mock_leaves_clean");

            if (!storedLeaves) {
                // Initialize with empty array primarily, avoiding demo data for "clean" state
                const initialData: LeaveRequest[] = [];
                localStorage.setItem("mock_leaves_clean", JSON.stringify(initialData));
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

    const openActionDialog = (id: string, type: "APPROVED" | "DECLINED") => {
        setSelectedLeaveId(id);
        setActionType(type);
        setRemarks(""); // Reset remarks
        setIsDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedLeaveId || !actionType) return;
        await handleStatusUpdate(selectedLeaveId, actionType, remarks);
        setIsDialogOpen(false);
        setSelectedLeaveId(null);
        setActionType(null);
    };

    const handleStatusUpdate = async (id: string, status: "APPROVED" | "DECLINED", remarks: string) => {
        try {
            const text = localStorage.getItem("mock_leaves_clean");
            if (!text) return;

            const currentLeaves = JSON.parse(text);
            const updatedLeaves = currentLeaves.map((leave: any) => {
                if (leave.id === id) {
                    return { ...leave, status, managerRemarks: remarks };
                }
                return leave;
            });

            localStorage.setItem("mock_leaves_clean", JSON.stringify(updatedLeaves));

            const targetLeave = updatedLeaves.find((l: any) => l.id === id);
            if (targetLeave && targetLeave.employeeId) {
                const remarkText = remarks ? ` Remarks: ${remarks}` : "";
                createNotification(targetLeave.employeeId, `Your leave request was ${status.toLowerCase()}.${remarkText}`, status === "APPROVED" ? "success" : "error");
            }

            toast.success(`Leave request ${status.toLowerCase()}`);
            fetchLeaves();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Leave Requests Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);

        // Add Filter Context to PDF
        let filterText = "Filters: ";
        if (statusFilter !== "ALL") filterText += `[Status: ${statusFilter}] `;
        if (dateFilter) filterText += `[Date: ${format(dateFilter, "MMM d, yyyy")}] `;
        if (searchQuery) filterText += `[Search: "${searchQuery}"]`;
        if (filterText === "Filters: ") filterText = "All Records";

        doc.setFontSize(10);
        doc.text(filterText, 14, 36);

        const tableColumn = ["Employee", "Department", "Reason", "Remarks", "Dates", "Status"];
        const tableRows: any[] = [];

        // Use filteredLeaves here
        filteredLeaves.forEach((leave) => {
            const leaveData = [
                leave.employee?.name || "Unknown",
                leave.employee?.department || "N/A",
                leave.reason,
                leave.managerRemarks || "-",
                `${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d, y")}`,
                leave.status,
            ];
            tableRows.push(leaveData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`Leave_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
        toast.success("Report downloaded successfully");
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                    <Button onClick={handleDownloadPDF} disabled={leaves.length === 0} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-white p-4 rounded-lg border shadow-sm">
                    {/* Search */}
                    <div className="w-full md:w-1/3">
                        <Label className="mb-1 block text-xs">Search Employee</Label>
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-1/4">
                        <Label className="mb-1 block text-xs">Status</Label>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="DECLINED">Declined</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="w-full md:w-1/4">
                        <Label className="mb-1 block text-xs">Filter by Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateFilter && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || statusFilter !== "ALL" || dateFilter) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("ALL");
                                setDateFilter(undefined);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </div>

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
                                    <TableHead>Remarks</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No leave requests found matching filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <TableRow key={leave.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{leave.employee?.name || "Unknown"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {leave.employee?.roleTitle} • {leave.employee?.department}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="truncate" title={leave.reason}>{leave.reason}</p>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <p className="truncate text-sm text-gray-500" title={leave.managerRemarks}>{leave.managerRemarks || "-"}</p>
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
                                                            onClick={() => openActionDialog(leave.id, "APPROVED")}
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => openActionDialog(leave.id, "DECLINED")}
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

                {/* Remarks Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{actionType === "APPROVED" ? "Approve" : "Decline"} Leave Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks (Optional)</Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Add any comments for the employee..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleConfirmAction}
                                variant={actionType === "DECLINED" ? "destructive" : "default"}
                                className={actionType === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
};

export default LeaveManagement;
