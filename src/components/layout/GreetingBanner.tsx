"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function GreetingBanner() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const displayName = user?.name || "Admin";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 bg-white px-5 py-2.5 text-2xs text-slate-700">
      <p className="font-normal text-slate-700">
        {greeting}, {displayName}. Welcome to Central Towing!
      </p>

    </div>
  );
}

