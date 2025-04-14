
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isProcessing: boolean;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  messages, 
  isProcessing,
  className 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      const message = input.trim();
      setInput('');
      await onSendMessage(message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-[500px] border rounded-lg bg-white", className)}>
      <div className="p-3 border-b bg-medical-600 text-white font-semibold rounded-t-lg">
        <h2>Symptom Scribe Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex items-start gap-2 p-2 rounded-lg max-w-[80%]",
              message.sender === 'user' 
                ? "ml-auto bg-medical-100 text-gray-800" 
                : "bg-symptom-100 text-gray-800"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              message.sender === 'user' ? "bg-medical-500" : "bg-symptom-500"
            )}>
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-symptom-100 text-gray-800 max-w-[80%]">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-symptom-500">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500">Processing your symptoms...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms here... (e.g., I have a headache, fever, and sore throat)"
          className="flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isProcessing}
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || isProcessing}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
