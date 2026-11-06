"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Send, CheckCircle2, AlertTriangle, Info, RefreshCw, X, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  id: string | number;
  target?: string;
  title: string;
  message: string;
  sentAt?: string;
  createdAt?: string;
  status?: string;
  isRead?: boolean;
  type?: string;
}

export default function NotificationsManagementPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New alert form
  const [target, setTarget] = useState("All Drivers");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "warning" | "success">("info");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string | number) => {
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, status: "read", isRead: true } : n))
    );

    try {
      await fetch(`/api/admin/notifications/${encodeURIComponent(String(id))}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAlert: NotificationItem = {
      id: `NOTIF-${String(notifications.length + 1).padStart(2, "0")}`,
      target,
      title: title.trim(),
      message: message.trim(),
      sentAt: "Just now",
      status: "delivered",
      type: alertType,
    };

    setNotifications((prev) => [newAlert, ...prev]);
    setIsModalOpen(false);
    setTitle("");
    setMessage("");

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newAlert),
      });
    } catch (err) {
      console.error("Failed to post notification:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Notifications Management Screen
            </h1>
            <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Live Push Feed
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Broadcast operational alerts, dispatch push notifications, and review system triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="gap-1 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Send className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>New Broadcast Alert</span>
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      {loading && notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs text-slate-600">Loading live dispatch alerts...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          No notifications found.
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, idx) => {
            const statusRaw = n.status || (n.isRead ? "read" : "delivered");
            const statusUpper = String(statusRaw).toUpperCase();
            const isUnread = String(statusRaw).toLowerCase() === "unread" || n.isRead === false;
            const targetText = n.target || (n.type === "driver" ? "All Drivers" : "Dispatch Broadcast");
            const timeText = n.sentAt || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently");

            return (
              <Card key={String(n.id || idx)} className="space-y-1.5 p-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      <Bell className="h-3.5 w-3.5 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-slate-800">{n.title}</h3>
                      <p className="text-[10px] font-normal text-slate-400">
                        Target: {targetText} &bull; {timeText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={statusUpper === "DELIVERED" || statusUpper === "READ" ? "success" : "warning"}>
                      {statusUpper}
                    </Badge>
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className="text-[11px] font-normal text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs font-normal text-slate-600 pl-9">
                  {n.message}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-medium text-slate-800">
                Send New Broadcast Alert
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Recipient Target *
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="All Drivers">All Drivers (Fleet Mobile App)</option>
                  <option value="All Customers">All Registered Customers</option>
                  <option value="System Broadcast">System Dispatch Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Demand Surge in St. Cloud Area"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Alert Message Content *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Push message content delivered directly to devices..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="cursor-pointer text-xs gap-1"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Alert</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
