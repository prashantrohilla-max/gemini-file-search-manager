"use client";

import { useState, useEffect } from "react";
import { CustomMetadata } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface MetadataEditorProps {
  value: CustomMetadata[];
  onChange: (metadata: CustomMetadata[]) => void;
}

type MetadataType = "string" | "number";

interface MetadataRow {
  key: string;
  value: string;
  type: MetadataType;
}

function toMetadataRows(metadata: CustomMetadata[]): MetadataRow[] {
  return metadata.map((m) => ({
    key: m.key,
    value: m.stringValue ?? m.numericValue?.toString() ?? "",
    type: m.numericValue !== undefined ? "number" : "string",
  }));
}

function toCustomMetadata(rows: MetadataRow[]): CustomMetadata[] {
  return rows
    .filter((r) => r.key.trim() !== "")
    .map((r) => {
      if (r.type === "number") {
        return { key: r.key, numericValue: parseFloat(r.value) || 0 };
      }
      return { key: r.key, stringValue: r.value };
    });
}

export function MetadataEditor({ value, onChange }: MetadataEditorProps) {
  const [rows, setRows] = useState<MetadataRow[]>(() => toMetadataRows(value));

  useEffect(() => {
    const incomingRows = toMetadataRows(value);
    const hasEmptyRows = rows.some((r) => r.key.trim() === "");
    if (!hasEmptyRows) {
      setRows(incomingRows);
    }
  }, [value]);

  const updateRow = (index: number, updates: Partial<MetadataRow>) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...updates };
    setRows(newRows);
    onChange(toCustomMetadata(newRows));
  };

  const addRow = () => {
    setRows([...rows, { key: "", value: "", type: "string" }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onChange(toCustomMetadata(newRows));
  };

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-slate-500">No metadata added yet.</p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Key"
            value={row.key}
            onChange={(e) => updateRow(index, { key: e.target.value })}
            className="flex-1"
          />
          <Select
            value={row.type}
            onValueChange={(type: MetadataType) => updateRow(index, { type })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Value"
            value={row.value}
            type={row.type === "number" ? "number" : "text"}
            onChange={(e) => updateRow(index, { value: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeRow(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Metadata
      </Button>
    </div>
  );
}
