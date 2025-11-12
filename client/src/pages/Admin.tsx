import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, CheckCircle2, XCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: providers, isLoading } = trpc.admin.getProviders.useQuery();
  const enableMutation = trpc.admin.enableProvider.useMutation({
    onSuccess: () => {
      utils.admin.getProviders.invalidate();
    },
  });
  const disableMutation = trpc.admin.disableProvider.useMutation({
    onSuccess: () => {
      utils.admin.getProviders.invalidate();
    },
  });

  if (authLoading || isLoading) {
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
            <CardTitle className="text-center">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login para acessar o painel administrativo
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
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerenciar provedores de IA e configurações do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provedores de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers?.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold capitalize">{provider.name}</h3>
                      {provider.enabled ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                      {provider.healthy ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {provider.supports.text && (
                        <Badge variant="outline">Texto</Badge>
                      )}
                      {provider.supports.image && (
                        <Badge variant="outline">Imagem</Badge>
                      )}
                      {provider.supports.video && (
                        <Badge variant="outline">Vídeo</Badge>
                      )}
                      {provider.supports.audio && (
                        <Badge variant="outline">Áudio</Badge>
                      )}
                      {provider.supports.midi && (
                        <Badge variant="outline">MIDI</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {provider.enabled ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          disableMutation.mutate({ name: provider.name })
                        }
                        disabled={disableMutation.isPending}
                      >
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          enableMutation.mutate({ name: provider.name })
                        }
                        disabled={enableMutation.isPending}
                      >
                        Ativar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Informações sobre Provedores
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>OpenAI</strong>: Requer OPENAI_API_KEY no ambiente
            </li>
            <li>
              • <strong>HuggingFace</strong>: Requer HF_API_KEY no ambiente
            </li>
            <li>
              • <strong>Stability AI</strong>: Requer STABILITY_API_KEY no ambiente
            </li>
            <li>
              • <strong>Runway/Pika</strong>: Placeholders - requerem acesso enterprise
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
