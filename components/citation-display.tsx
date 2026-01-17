"use client";

import { GroundingChunk } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink } from "lucide-react";

interface CitationDisplayProps {
  citations: GroundingChunk[];
}

export function CitationDisplay({ citations }: CitationDisplayProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 overflow-hidden">
      <p className="text-xs font-medium text-slate-500 mb-2">
        Sources ({citations.length})
      </p>
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-2 pr-2">
          {citations.map((citation, index) => (
            <div
              key={index}
              className="p-2 rounded bg-white/50 border border-slate-200 text-sm overflow-hidden"
            >
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      [{index + 1}]
                    </Badge>
                    {citation.retrievedContext?.title && (
                      <span className="font-medium text-slate-700 truncate block">
                        {citation.retrievedContext.title}
                      </span>
                    )}
                  </div>
                  {citation.retrievedContext?.text && (
                    <p className="mt-1 text-slate-600 text-xs line-clamp-3 break-words">
                      {citation.retrievedContext.text}
                    </p>
                  )}
                  {citation.retrievedContext?.uri && (
                    <a
                      href={citation.retrievedContext.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-blue-600 hover:underline inline-flex items-center gap-1 max-w-full"
                    >
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">View source</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
