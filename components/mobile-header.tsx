"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { ReactNode } from "react";

const MOBILE_HEADER_Z_INDEX = "z-20";

interface MobileHeaderProps {
  title: string;
  backHref?: string;
  isLoading?: boolean;
  actions?: ReactNode;
}

export function MobileHeader({
  title,
  backHref,
  isLoading,
  actions,
}: MobileHeaderProps) {
  return (
    <div
      className={`md:hidden sticky top-0 ${MOBILE_HEADER_Z_INDEX} flex items-center justify-between p-3 border-b bg-white`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {backHref && (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <Database
            className={`${backHref ? "h-4 w-4" : "h-6 w-6"} text-slate-${backHref ? "500" : "700"} shrink-0`}
          />
          {isLoading ? (
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          ) : (
            <h1
              className={`${backHref ? "text-sm" : "text-base"} font-semibold text-slate-900 truncate`}
            >
              {title}
            </h1>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-1 shrink-0">{actions}</div>
      )}
    </div>
  );
}
