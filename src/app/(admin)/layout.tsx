"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-8 pt-4 px-4 sm:px-6 md:px-8 max-w-[1920px] w-full mx-auto transition-all">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
