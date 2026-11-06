"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Users,
  UserCheck,
  Car,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tow Requests", href: "/tows", icon: Truck },
    { name: "Live Map", href: "/live-map", icon: MapPin },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Customers", href: "/customers", icon: UserCheck },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "Pricing & Rates", href: "/pricing", icon: DollarSign },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen w-56 flex-col border-r border-slate-200/80 bg-white",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200/80 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <Truck className="h-4 w-4 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-xs font-medium tracking-tight text-slate-800">
            Towing Admin
          </h1>
          <p className="text-[10px] font-normal text-slate-400">
            Dispatch & Operations
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-1.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-normal transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 stroke-[1.75] transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User / Logout Section */}
      <div className="border-t border-slate-200/80 p-3">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-normal text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 stroke-[1.75]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
