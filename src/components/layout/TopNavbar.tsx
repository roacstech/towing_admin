"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LogoutDialog } from "./LogoutDialog";

export function TopNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
    setShowProfileMenu(false);
  };

  const dispatchingGroup = {
    title: "Dispatching",
    id: "dispatching",
    items: [
      { label: "Towing Request Management", href: "/tows" },
      { label: "Trip History Screen", href: "/trips" },
    ],
  };

  const remainingGroups = [
    {
      title: "Drivers",
      id: "drivers",
      items: [
        { label: "Driver Management Screen", href: "/drivers" },
        { label: "Driver Document Verification", href: "/drivers/verification" },
      ],
    },
    {
      title: "Customers",
      id: "customers",
      items: [
        { label: "Customer Management Screen", href: "/customers" },
        { label: "Customer Feedback & Reviews", href: "/reviews" },
      ],
    },
    {
      title: "Services",
      id: "services",
      items: [
        { label: "Service Management Screen", href: "/services-management" },
        { label: "Pricing Management Screen", href: "/pricing" },
      ],
    },
    {
      title: "Finance",
      id: "finance",
      items: [
        { label: "Payment Management Screen", href: "/payments" },
        { label: "Earnings & Commission Screen", href: "/earnings" },
      ],
    },
    {
      title: "Support",
      id: "support",
      items: [
        { label: "Support & Complaints Screen", href: "/support" },
        { label: "Notifications Management", href: "/notifications" },
      ],
    },
  ];

  const adminName = user?.name || "Admin";
  const userRole =
    (user?.role || "Manager").toLowerCase() === "admin"
      ? "Manager"
      : (user?.role || "Manager").charAt(0).toUpperCase() + (user?.role || "Manager").slice(1);

  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  const isDispatchingActive = dispatchingGroup.items.some((item) =>
    pathname.startsWith(item.href)
  );

  const isMapActive =
    pathname === "/map" ||
    pathname.startsWith("/live-map") ||
    pathname.startsWith("/live-tracking");

  return (
    <>
      <header
        ref={navRef}
        className="fixed top-0 inset-x-0 z-50 flex h-12 w-full items-center justify-between bg-[#0060df] px-3 sm:px-4 text-white shadow-xs"
      >
        {/* Left: Central Towing Brand & Main Nav */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 mr-2 text-white hover:opacity-95 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-white/15 text-white">
              <Truck className="h-4 w-4 stroke-[1.75]" />
            </div>
            <span className="text-sm font-medium tracking-tight text-white flex items-center gap-0.5">
              Central Towing
            </span>
          </Link>

          {/* Navigation Links - Standard text-sm (matching 2nd image) */}
          <nav className="flex items-center space-x-1 md:space-x-1.5 text-sm">
            {/* 1. Dashboard */}
            <Link
              href="/"
              onClick={() => setOpenDropdown(null)}
              className={`rounded-md px-3 py-1.5 text-sm font-normal transition-colors ${
                pathname === "/"
                  ? "bg-[#004b99] text-white font-medium shadow-xs"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              Dashboard
            </Link>

            {/* 2. Dispatching Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown(dispatchingGroup.id)}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-normal transition-colors cursor-pointer ${
                  isDispatchingActive || openDropdown === dispatchingGroup.id
                    ? "bg-[#004b99] text-white font-medium"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <span>{dispatchingGroup.title}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-90 stroke-[1.75]" />
              </button>

              {openDropdown === dispatchingGroup.id && (
                <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1.5 text-sm text-slate-700 shadow-xl z-50">
                  {dispatchingGroup.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className={`block px-3.5 py-2 text-xs sm:text-sm font-normal transition-colors ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Direct Map Menu Link */}
            <Link
              href="/map"
              onClick={() => setOpenDropdown(null)}
              className={`rounded-md px-3 py-1.5 text-sm font-normal transition-colors ${
                isMapActive
                  ? "bg-[#004b99] text-white font-medium"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              Map
            </Link>

            {/* 4. Remaining Groups (Drivers, Customers, Services, Finance, Support) */}
            {remainingGroups.map((group) => {
              const isOpen = openDropdown === group.id;
              const isGroupActive = group.items.some((item) =>
                pathname.startsWith(item.href)
              );

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(group.id)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-normal transition-colors cursor-pointer ${
                      isGroupActive || isOpen
                        ? "bg-[#004b99] text-white font-medium"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <span>{group.title}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-90 stroke-[1.75]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1.5 text-sm text-slate-700 shadow-xl z-50">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`block px-3.5 py-2 text-xs sm:text-sm font-normal transition-colors ${
                            pathname === item.href
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 5. Reports Direct Link */}
            <Link
              href="/reports"
              onClick={() => setOpenDropdown(null)}
              className={`rounded-md px-3 py-1.5 text-sm font-normal transition-colors ${
                pathname.startsWith("/reports")
                  ? "bg-[#004b99] text-white font-medium"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              Reports
            </Link>

            {/* 6. Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("settings")}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-normal transition-colors cursor-pointer ${
                  pathname.startsWith("/settings") ||
                  pathname.startsWith("/profile") ||
                  openDropdown === "settings"
                    ? "bg-[#004b99] text-white font-medium"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <span>Settings</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-90 stroke-[1.75]" />
              </button>

              {openDropdown === "settings" && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1.5 text-sm text-slate-700 shadow-xl z-50">
                  <Link
                    href="/settings"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3.5 py-2 text-xs sm:text-sm font-normal text-slate-700 hover:bg-slate-50"
                  >
                    Settings Screen
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3.5 py-2 text-xs sm:text-sm font-normal text-slate-700 hover:bg-slate-50"
                  >
                    Admin Profile Screen
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Company & User Profile Button, Notification, Help, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Account Button with hover background change (Matching Reference) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setOpenDropdown(null);
              }}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 sm:px-3 py-1 transition-all duration-150 cursor-pointer ${
                showProfileMenu
                  ? "bg-[#004b99]"
                  : "hover:bg-[#004b99]"
              }`}
              title="User Account Details"
            >
              {/* Text label: Company Name & User Name/Role */}
              <div className="hidden text-right md:block leading-tight">
                <p className="text-xs sm:text-[13px] font-medium text-white tracking-tight">
                  Central Towing Service
                </p>
                <p className="text-[11px] font-normal text-sky-100 opacity-90 mt-0.5">
                  {adminName} ({userRole})
                </p>
              </div>

              {/* Circle Avatar: White background with blue text */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#0060df] text-xs font-medium shadow-2xs">
                {initials}
              </div>

              {/* Down Chevron */}
              <ChevronDown
                className={`h-3.5 w-3.5 text-white/90 stroke-[2] transition-transform duration-150 ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-slate-200 bg-white py-1.5 text-xs sm:text-sm text-slate-700 shadow-xl z-50">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-normal"
                >
                  <User className="h-4 w-4 text-slate-400 stroke-[1.75]" />
                  <span>Admin Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-normal"
                >
                  <Settings className="h-4 w-4 text-slate-400 stroke-[1.75]" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutDialog(true);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-normal text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4 stroke-[1.75]" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <Link
            href="/notifications"
            title="Notifications"
            className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Bell className="h-4 w-4 stroke-[1.75]" />
          </Link>

          {/* Help Question Icon */}
          <Link
            href="/support"
            title="Support & Complaints"
            className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <HelpCircle className="h-4 w-4 stroke-[1.75]" />
          </Link>

          {/* Logout Action Button */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            title="Logout Confirmation"
            className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>
      </header>

      {/* Fixed Navbar Placeholder Spacer */}
      <div className="h-12 w-full shrink-0" aria-hidden="true" />

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          logout();
        }}
      />
    </>
  );
}
