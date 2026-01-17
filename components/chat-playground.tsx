"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useChatStream } from "@/hooks/use-chat";
import { SUPPORTED_MODELS, DEFAULT_MODEL } from "@/lib/gemini";
import { CitationDisplay } from "@/components/citation-display";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, User, Bot, Trash2, Square } from "lucide-react";
import { toast } from "sonner";

interface ChatPlaygroundProps {
  storeId: string;
}

export function ChatPlayground({ storeId }: ChatPlaygroundProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [metadataFilter, setMetadataFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastErrorRef = useRef<string | null>(null);

  const { messages, isStreaming, error, sendMessage, clearMessages, abortStream } =
    useChatStream({
      storeId,
      model,
      metadataFilter,
    });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Show error via toast (only once per error)
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      toast.error(error);
      lastErrorRef.current = error;
    } else if (!error) {
      lastErrorRef.current = null;
    }
  }, [error]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;

      const content = input.trim();
      setInput("");
      await sendMessage(content);
    },
    [input, isStreaming, sendMessage]
  );

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-slate-900">RAG Playground</h3>
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter options */}
      <Accordion type="single" collapsible className="flex-shrink-0 px-4 border-b">
        <AccordionItem value="filter" className="border-none">
          <AccordionTrigger className="text-sm py-2">
            Metadata Filter
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              <Label htmlFor="metadataFilter" className="text-xs">
                Filter Expression
              </Label>
              <Input
                id="metadataFilter"
                value={metadataFilter}
                onChange={(e) => setMetadataFilter(e.target.value)}
                placeholder='e.g., author = "Smith" AND year > 2020'
                className="text-sm"
              />
              <p className="text-xs text-slate-500">
                Use AIP-160 filter syntax to search specific documents.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">
              Ask a question about your documents
            </p>
            <p className="text-sm text-slate-400 mt-1">
              The AI will search your uploaded files to answer
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-slate-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <>
                    {message.content ? (
                      <div className="prose prose-sm max-w-none overflow-x-auto">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : isStreaming && index === messages.length - 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : null}
                  </>
                )}
                {message.role === "assistant" && message.citations && (
                  <CitationDisplay citations={message.citations} />
                )}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="min-h-[44px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="destructive"
              onClick={abortStream}
              className="flex-shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
