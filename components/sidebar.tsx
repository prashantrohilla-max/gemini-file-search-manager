"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Database, Bug, Github } from "lucide-react";

const navigation = [
  { name: "Stores", href: "/", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Database className="h-6 w-6 text-slate-700" />
          <span className="font-semibold text-slate-900">File Search</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-3 space-y-1">
        <a
          href="https://github.com/prashantrohilla-max/gemini-file-search-manager"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Github className="h-5 w-5" />
          GitHub
        </a>
        <a
          href="https://github.com/prashantrohilla-max/gemini-file-search-manager/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Bug className="h-5 w-5" />
          Report issue
        </a>
      </div>
      <div className="border-t p-4">
        <p className="text-xs text-slate-500">
          Powered by Gemini API
        </p>
      </div>
    </div>
  );
}
