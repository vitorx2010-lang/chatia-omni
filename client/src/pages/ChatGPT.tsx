import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Plus,
  Menu,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Brain,
  Upload,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";

export default function ChatGPT() {
  const { user, loading: authLoading, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.chat.useMutation();
  const { data: conversationData } = trpc.chat.getConversation.useQuery(
    { id: currentConversationId! },
    { enabled: !!currentConversationId }
  );
  const { data: conversations } = trpc.chat.listConversations.useQuery(undefined, {
    enabled: !!user,
  });
  const memoryToggleMutation = trpc.memory.enableMemory.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData?.messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");

    try {
      const result = await chatMutation.mutateAsync({
        conversationId: currentConversationId || undefined,
        message: userMessage,
        options: {
          includeMemory: memoryEnabled,
        },
      });

      if (!currentConversationId) {
        setCurrentConversationId(result.conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMemoryEnabled(false);
  };

  const memoryDisableMutation = trpc.memory.disableMemory.useMutation();
  const memoryEnableMutation = trpc.memory.enableMemory.useMutation();

  const toggleMemory = async () => {
    if (!currentConversationId) return;

    try {
      if (memoryEnabled) {
        await memoryDisableMutation.mutateAsync({ conversationId: currentConversationId });
      } else {
        await memoryEnableMutation.mutateAsync({ conversationId: currentConversationId });
      }
      setMemoryEnabled(!memoryEnabled);
    } catch (error) {
      console.error("Error toggling memory:", error);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Chatia-Omni</h1>
            <p className="text-gray-400">
              Chat de IA multimodal com orquestração de múltiplos provedores
            </p>
          </div>
          <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
            <a href={getLoginUrl()}>Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <div className="p-4 border-b border-gray-800">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  currentConversationId === conv.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <p className="truncate">{conv.title || "Conversa sem título"}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
          <Button
            onClick={() => logout()}
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Chatia-Omni</h1>
              <p className="text-xs text-gray-500">
                {conversationData?.conversation?.title || "Nova conversa"}
              </p>
            </div>
          </div>

          {currentConversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMemory}
              className={cn(
                "gap-2",
                memoryEnabled
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {memoryEnabled ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
              <span className="text-xs">Memória {memoryEnabled ? "ON" : "OFF"}</span>
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {!conversationData?.messages || conversationData.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Sparkles className="h-16 w-16 text-gray-700 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Bem-vindo ao Chatia-Omni
                </h2>
                <p className="text-gray-400 max-w-md mb-6">
                  Comece uma conversa. Múltiplos provedores de IA trabalham juntos para dar
                  a melhor resposta.
                </p>
                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <Brain className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Inteligente</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <Zap className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Rápido</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <Sparkles className="h-5 w-5 text-pink-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Multimodal</p>
                  </div>
                </div>
              </div>
            ) : (
              conversationData.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-4 animate-in fade-in slide-in-from-bottom-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-2xl rounded-lg px-4 py-3",
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    )}
                  >
                    {msg.role === "assistant" && msg.providerResponses && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {msg.providerResponses.map((pr: any, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs bg-gray-700 text-gray-200"
                          >
                            {pr.provider}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Streamdown>{msg.content}</Streamdown>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold">U</span>
                    </div>
                  )}
                </div>
              ))
            )}

            {chatMutation.isPending && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-gray-800 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                <Upload className="h-5 w-5" />
              </Button>

              <div className="flex-1 flex gap-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Envie uma mensagem..."
                  className="min-h-[48px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || chatMutation.isPending}
                  size="icon"
                  className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Chatia-Omni pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
