import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const chatMutation = trpc.chat.chat.useMutation();
  const { data: conversationData } = trpc.chat.getConversation.useQuery(
    { id: currentConversationId! },
    { enabled: !!currentConversationId }
  );

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");

    try {
      const result = await chatMutation.mutateAsync({
        conversationId: currentConversationId || undefined,
        message: userMessage,
        options: {
          includeMemory: false,
        },
      });

      if (!currentConversationId) {
        setCurrentConversationId(result.conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Chatia-Omni</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Chat de IA multimodal com orquestração de múltiplos provedores
            </p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Chatia-Omni
          </h1>
          <p className="text-muted-foreground mt-2">
            Chat de IA com orquestração de múltiplos provedores
          </p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
              {conversationData?.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" && msg.providerResponses && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {msg.providerResponses.map((pr: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {pr.provider}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[80px]"
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
                className="h-[80px] w-[80px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Powered by múltiplos provedores de IA • OpenAI • HuggingFace • Stability AI
          </p>
        </div>
      </div>
    </div>
  );
}
