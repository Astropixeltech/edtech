import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, CheckCircle2, XCircle, Image as ImageIcon, Sparkles, Zap, Palette, Users, BookOpen, FileText, MessageSquare, Database, Paperclip, X, File, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{
    success: boolean;
    table: string;
    type: string;
    error?: string;
  }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
  timestamp: Date;
}

const capabilities = [
  { icon: Palette, labelBn: "Manage Works", labelEn: "Manage Works", color: "from-pink-500 to-rose-500" },
  { icon: FileText, labelBn: "Edit Page ✨", labelEn: "Edit Pages ✨", color: "from-blue-500 to-cyan-500" },
  { icon: Users, labelBn: "Manage Team", labelEn: "Team Members", color: "from-emerald-500 to-green-500" },
  { icon: BookOpen, labelBn: "Courses", labelEn: "Courses", color: "from-violet-500 to-purple-500" },
  { icon: Database, labelBn: "Services", labelEn: "Services", color: "from-amber-500 to-orange-500" },
  { icon: MessageSquare, labelBn: "Contact & Footer", labelEn: "Contact & Footer", color: "from-sky-500 to-blue-500" },
  { icon: Zap, labelBn: "Site Settings", labelEn: "Site Settings", color: "from-red-500 to-orange-500" },
  { icon: Sparkles, labelBn: "Academic Prep 📚", labelEn: "Academic Prep 📚", color: "from-fuchsia-500 to-pink-500" },
];

interface AdminAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminAssistant({ isOpen, onToggle }: AdminAssistantProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string; file?: File }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasStarted = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Upload file to storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: typeof attachments = [];

    for (const file of Array.from(files)) {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      try {
        const ext = file.name.split('.').pop();
        const path = `assistant/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media-uploads')
          .upload(path, file, { upsert: true });

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media-uploads')
          .getPublicUrl(path);

        const isImage = file.type.startsWith('image/');
        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: isImage ? 'image' : 'file',
        });
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed && attachments.length === 0) return;

    let fullMessage = trimmed;
    
    // Append attachment info
    for (const att of attachments) {
      if (att.type === 'image') {
        fullMessage += `\n\n[Image URL: ${att.url}]`;
      } else {
        fullMessage += `\n\n[File: ${att.name} - ${att.url}]`;
      }
    }

    const userMessage: Message = {
      role: "user",
      content: trimmed,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("admin-ai-assistant", {
        body: {
          message: fullMessage,
          conversation_history: history,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || "Something went wrong.",
        actions: data.actions_executed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.has_actions && data.actions_executed?.some((a: any) => a.success)) {
        toast.success(language === "bn" ? "✅ Action successful!" : "✅ Action completed!");
      }
    } catch (error: any) {
      console.error("Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "bn"
            ? "Sorry, something went wrong. Please try again."
            : "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = language === "bn"
    ? ["What's on the homepage?", "Change homepage title", "Add new Work", "Show all Services", "Update Contact info", "Edit About page"]
    : ["What's on Home page?", "Change Home title", "Add new Work", "Show Services", "Update Contact", "Edit About page"];

  if (!isOpen) return null;

  const panelWidth = isExpanded ? "w-[600px]" : "w-[380px]";

  return (
    <div className={`fixed right-0 top-0 bottom-0 ${panelWidth} bg-white dark:bg-slate-900 border-l border-border/50 shadow-2xl z-50 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Alpha Assistant
          </h2>
          <p className="text-[10px] text-muted-foreground truncate">
            {language === "bn" ? "Manage site with AI" : "Manage your site with AI"}
          </p>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
          Online
        </Badge>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages / Welcome */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-6">
            {/* Welcome */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/25 animate-pulse">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
              {language === "bn" ? "How can I help?" : "How can I help?"}
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5 max-w-[260px]">
              {language === "bn"
                ? "Tell me what to do — change page text, add Works, upload images — I can do it all ⚡🎨"
                : "Tell me — edit page text, add works, upload images — I can do it all ⚡🎨"}
            </p>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-2 w-full mb-5">
              {capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 bg-card/50 hover:border-purple-500/30 transition-all"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cap.color} flex items-center justify-center flex-shrink-0`}>
                    <cap.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground/80 leading-tight">
                    {language === "bn" ? cap.labelBn : cap.labelEn}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[10px] h-7 px-3 border-purple-500/20 hover:bg-purple-500/10"
                  onClick={() => sendMessage(action)}
                >
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  {action}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === "user"
                      ? "bg-primary/10 text-primary"
                      : "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/50 border border-border/50 rounded-bl-md"
                  }`}
                >
                  {/* Attachments preview */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {msg.attachments.map((att, j) => (
                        att.type === 'image' ? (
                          <img key={j} src={att.url} alt={att.name} className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                        ) : (
                          <div key={j} className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                            <File className="w-3 h-3" />
                            <span className="text-[10px] truncate max-w-[80px]">{att.name}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-border/30 pt-1.5">
                      {msg.actions.map((action, j) => (
                        <div
                          key={j}
                          className={`flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded-lg ${
                            action.success
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {action.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>
                            {action.type === "insert" && "➕ "}
                            {action.type === "update" && "✏️ "}
                            {action.type === "delete" && "🗑️ "}
                            {action.table}
                            {action.error && ` — ${action.error}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[9px] mt-1.5 opacity-30">
                    {msg.timestamp.toLocaleTimeString(language === "bn" ? "bn-BD" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {language === "bn" ? "Thinking..." : "Thinking..."}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-3 py-2 border-t border-border/30 bg-secondary/20">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                {att.type === 'image' ? (
                  <img src={att.url} alt={att.name} className="w-12 h-12 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center border border-border">
                    <File className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[7px] text-muted-foreground truncate w-10 text-center mt-0.5">{att.name.split('.').pop()}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-end gap-1.5 border border-border/60 rounded-xl bg-card p-1.5 shadow-sm">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg flex-shrink-0 h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title={language === "bn" ? "Add file/image" : "Attach files/images"}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Paperclip className={`w-3.5 h-3.5 ${attachments.length > 0 ? "text-violet-500" : ""}`} />
            )}
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "bn"
                ? "Tell me what to do..."
                : "Tell me what to do..."
            }
            className="min-h-[36px] max-h-[100px] border-0 resize-none focus-visible:ring-0 text-xs bg-transparent py-2"
            rows={1}
          />
          <Button
            size="icon"
            className="rounded-lg flex-shrink-0 h-8 w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-md shadow-purple-500/20"
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
