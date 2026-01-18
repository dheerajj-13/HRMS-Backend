
export interface Notification {
    id: string;
    userId: string; // The user who should see this notification
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
}

const STORAGE_KEY = "mock_notifications";

export const getNotifications = (currentUserId: string, role?: string): Notification[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const all: Notification[] = JSON.parse(stored);
        // Return notifications for this user, "ALL", or matching ROLE (case-insensitive usually, but strict here)
        return all.filter(n =>
            n.userId === currentUserId ||
            n.userId === "ALL" ||
            (role && n.userId === role.toUpperCase()) || // Match "MANAGER"
            (role && n.userId === role)
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
        return [];
    }
};

export const createNotification = (userId: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const all: Notification[] = stored ? JSON.parse(stored) : [];

        const newNotif: Notification = {
            id: crypto.randomUUID(),
            userId,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };

        all.push(newNotif);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

        // Dispatch event so hooks can auto-update
        window.dispatchEvent(new Event("storage"));
    } catch (e) {
        console.error("Failed to create notification", e);
    }
};

export const markAsRead = (id: string) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const all: Notification[] = JSON.parse(stored);
        const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
    } catch (e) {
        console.error("Failed to mark read", e);
    }
};
