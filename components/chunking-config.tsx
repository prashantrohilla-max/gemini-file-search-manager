"use client";

import { ChunkingConfig } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChunkingConfigFormProps {
  value: ChunkingConfig;
  onChange: (config: ChunkingConfig) => void;
}

export function ChunkingConfigForm({
  value,
  onChange,
}: ChunkingConfigFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="maxTokensPerChunk">Max Tokens Per Chunk</Label>
        <Input
          id="maxTokensPerChunk"
          type="number"
          placeholder="Default (API decides)"
          value={value.maxTokensPerChunk || ""}
          onChange={(e) =>
            onChange({
              ...value,
              maxTokensPerChunk: e.target.value
                ? parseInt(e.target.value, 10)
                : undefined,
            })
          }
        />
        <p className="text-xs text-slate-500">
          Maximum number of tokens per chunk. Leave empty for API default.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxOverlapTokens">Max Overlap Tokens</Label>
        <Input
          id="maxOverlapTokens"
          type="number"
          placeholder="Default (API decides)"
          value={value.maxOverlapTokens || ""}
          onChange={(e) =>
            onChange({
              ...value,
              maxOverlapTokens: e.target.value
                ? parseInt(e.target.value, 10)
                : undefined,
            })
          }
        />
        <p className="text-xs text-slate-500">
          Number of overlapping tokens between chunks.
        </p>
      </div>
    </div>
  );
}
