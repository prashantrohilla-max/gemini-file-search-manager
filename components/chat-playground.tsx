"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChat, ChatMessage } from "@/hooks/use-chat";
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
import { Send, Loader2, User, Bot, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChatPlaygroundProps {
  storeId: string;
}

export function ChatPlayground({ storeId }: ChatPlaygroundProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [metadataFilter, setMetadataFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chat.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await chat.mutateAsync({
        storeId,
        messages: newMessages,
        model,
        metadataFilter: metadataFilter || undefined,
      });

      setMessages([...newMessages, response.message]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
      // Remove the user message if the request failed
      setMessages(messages);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
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
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter options */}
      <Accordion type="single" collapsible className="px-4 border-b">
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
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
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
                  <div className="prose text-sm">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
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

          {chat.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-lg px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
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
          <Button
            type="submit"
            disabled={!input.trim() || chat.isPending}
            className="flex-shrink-0"
          >
            {chat.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
