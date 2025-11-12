import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Brain, Shield, MessageSquare, Settings } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/chat">Chat</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/admin">Admin</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Fazer Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            Chat de IA Multimodal com Orquestração Inteligente
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Combine o poder de múltiplos provedores de IA em uma única resposta.
            OpenAI, HuggingFace, Stability AI e mais, trabalhando juntos.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="text-lg">
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Começar a Conversar
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-lg">
                <a href={getLoginUrl()}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Começar Agora
                </a>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/admin">
                <Settings className="mr-2 h-5 w-5" />
                Admin Panel
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Orquestração Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Chama múltiplos provedores de IA em paralelo e combina as melhores
                respostas em uma única resposta consolidada.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Multimodal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suporta texto, imagens, áudio, vídeo e música. Geração e análise
                de múltiplos formatos de mídia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Seguro e Confiável</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Filtros de segurança, rate limits, sanitização de PII e auditoria
                completa de todas as operações.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Providers */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">Provedores Suportados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "OpenAI",
              "HuggingFace",
              "Stability AI",
              "Replicate",
            ].map((provider) => (
              <div
                key={provider}
                className="p-4 bg-white rounded-lg border shadow-sm"
              >
                <p className="font-semibold">{provider}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Chatia-Omni. Powered by Manus.ai</p>
        </div>
      </footer>
    </div>
  );
}
