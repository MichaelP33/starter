"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSend, 
  placeholder = "Choose an option below or describe your needs...", 
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative flex w-full max-w-2xl items-center", 
        className
      )}
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="pr-12 py-6 text-base bg-white border-muted shadow-sm rounded-full transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary/50"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className={cn(
          "absolute right-2 rounded-full h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10",
          message.trim() && "text-primary"
        )}
        disabled={!message.trim()}
      >
        <SendIcon className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}