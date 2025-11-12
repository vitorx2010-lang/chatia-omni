# Chatia-Omni

Chat de IA multimodal e modular que orquestra várias IAs (LLMs, geradores de imagem, vídeo, áudio/música, síntese de voz) em paralelo, combina respostas via um Combiner LLM para produzir uma resposta final unificada.

## 🚀 Features Implementadas

### ✅ Core Features
- **Orquestração Inteligente**: Chama múltiplos provedores de IA em paralelo (OpenAI, HuggingFace, Stability AI)
- **Combiner LLM**: Unifica respostas de múltiplos provedores em uma resposta consolidada
- **Chat Interface**: Interface moderna e responsiva para conversas
- **Admin Panel**: Gerenciamento de provedores (ativar/desativar, health check)
- **Database Schema**: Estrutura completa para conversations, messages, files, voices, jobs, providers
- **Authentication**: Sistema de autenticação com Manus OAuth

### 🎨 Frontend
- **Landing Page**: Design moderno com gradientes e animações
- **Chat UI**: Interface de chat com provider badges e markdown rendering
- **Admin UI**: Painel administrativo para gerenciar provedores
- **Responsive Design**: Totalmente responsivo com Tailwind CSS

### 🔧 Backend
- **tRPC API**: APIs type-safe com tRPC
- **Adapters**: Sistema modular de adapters para diferentes provedores
- **Base Adapter**: Retry logic, timeout, sanitização de PII
- **Orchestrator**: Orquestração paralela com Promise.allSettled
- **Database Helpers**: Funções auxiliares para todas as tabelas

### 🤖 Provedores Implementados

#### Texto
- ✅ **OpenAI** (GPT-4o-mini)
- ✅ **HuggingFace** (Llama-3.2)

#### Imagens
- ✅ **Stability AI** (Stable Diffusion XL)

#### Música/Áudio
- ✅ **HuggingFace MusicGen** (geração de música)

#### Vídeo (Placeholders)
- 📝 **Runway ML** (requer acesso enterprise)
- 📝 **Pika Labs** (API não disponível publicamente)
- 📝 **Replicate** (implementável)

## 📋 Próximas Features (TODO)

### Memory System
- [ ] Toggle ON/OFF de memória por conversa
- [ ] Summarization automática a cada X mensagens
- [ ] Integração com Vector DB (Pinecone/Weaviate)
- [ ] Endpoints de memory management

### Files & RAG
- [ ] Upload de arquivos (PDF, DOCX, imagens, áudio, vídeo)
- [ ] Extração de texto (OCR, ASR, parsing)
- [ ] Chunking com overlap
- [ ] Indexação no Vector DB
- [ ] Busca semântica

### Media Generation
- [ ] Geração de imagens (múltiplos providers)
- [ ] Geração de vídeos (async jobs)
- [ ] Geração de música completa (MIDI + stems + master)
- [ ] Job status tracking

### Voice Synthesis
- [ ] Consent flow com nonce validation
- [ ] ASR para validação de consentimento
- [ ] Watermarking de áudio gerado
- [ ] Revoke consent endpoint

### Code Generation
- [ ] Planner LLM para decomposição
- [ ] Codegen paralelo
- [ ] TypeScript compile + ESLint
- [ ] Security checks
- [ ] ZIP ou GitHub push

### Security & Safety
- [ ] Safety check para conteúdo
- [ ] Rate limits por usuário/plano
- [ ] Quotas configuráveis
- [ ] Audit logging completo

### Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests (Supertest)
- [ ] E2E smoke tests

## 🛠️ Setup

### Pré-requisitos
- Node.js 22+
- pnpm
- MySQL/TiDB database (configurado automaticamente pelo Manus)

### Instalação

```bash
# Instalar dependências
pnpm install

# Aplicar migrations do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Configuração de API Keys

Para habilitar os provedores de IA, você precisa configurar as seguintes chaves de API através do painel de Secrets do Manus:

#### Obrigatórias (para funcionalidade básica)
- `OPENAI_API_KEY` - [Obter em OpenAI Platform](https://platform.openai.com/api-keys)

#### Opcionais (para features adicionais)
- `HF_API_KEY` - [Obter em HuggingFace](https://huggingface.co/settings/tokens)
- `STABILITY_API_KEY` - [Obter em Stability AI](https://platform.stability.ai/account/keys)
- `REPLICATE_API_TOKEN` - [Obter em Replicate](https://replicate.com/account/api-tokens)
- `ELEVENLABS_API_KEY` - [Obter em ElevenLabs](https://elevenlabs.io/)

#### Configuração Adicional
- `ENABLED_PROVIDERS` - Lista de provedores ativos (ex: "openai,huggingface,stability")
- `PROVIDER_TIMEOUT_MS` - Timeout para chamadas de providers (padrão: 8000ms)
- `MAX_PROVIDERS` - Número máximo de providers a chamar em paralelo (padrão: 5)

## 📁 Estrutura do Projeto

```
chatia-omni/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Chat, Admin)
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # tRPC client
├── server/                # Backend
│   ├── adapters/          # Provider adapters
│   │   ├── base-adapter.ts
│   │   ├── openai-adapter.ts
│   │   ├── huggingface-adapter.ts
│   │   ├── stability-adapter.ts
│   │   └── adapter-manager.ts
│   ├── services/          # Business logic
│   │   └── orchestrator.ts
│   ├── routers/           # tRPC routers
│   │   ├── chat-router.ts
│   │   └── admin-router.ts
│   ├── db-helpers.ts      # Database helpers
│   └── routers.ts         # Main router
├── drizzle/               # Database schema
│   └── schema.ts
├── shared/                # Shared types
│   └── adapter-types.ts
└── todo.md                # Task tracking
```

## 🎯 Como Usar

### 1. Acessar o Site
Abra o site no navegador. Você verá a landing page com informações sobre o Chatia-Omni.

### 2. Fazer Login
Clique em "Fazer Login" para autenticar com Manus OAuth.

### 3. Usar o Chat
- Clique em "Começar a Conversar" ou navegue para `/chat`
- Digite sua mensagem no campo de texto
- O sistema irá orquestrar múltiplos provedores em paralelo
- Você verá badges indicando quais provedores foram usados
- A resposta final será uma combinação inteligente de todas as respostas

### 4. Admin Panel
- Navegue para `/admin`
- Veja o status de todos os provedores
- Ative ou desative provedores conforme necessário
- Veja health checks em tempo real

## 🔒 Segurança

- **PII Sanitization**: Sanitização automática de informações pessoais (emails, telefones, cartões)
- **Timeout Protection**: Timeout configurável para evitar chamadas longas
- **Retry Logic**: Retry exponencial para lidar com falhas temporárias
- **Error Handling**: Tratamento robusto de erros em todos os adapters

## 📊 Arquitetura

### Fluxo de Orquestração

1. **Usuário envia mensagem** → Chat UI
2. **tRPC mutation** → `chat.chat`
3. **Orchestrator** resolve providers a usar
4. **Chamadas paralelas** → Promise.allSettled
5. **Normalização** de respostas
6. **Combiner LLM** unifica respostas
7. **Persistência** no banco de dados
8. **Retorno** para o usuário

### Adapter Pattern

Todos os adapters implementam a interface `IAAdapter`:

```typescript
interface IAAdapter {
  name: string;
  call(opts: {
    prompt: string;
    userId?: string;
    conversationId?: string;
    options?: any;
  }): Promise<ProviderResponse>;
  supports?: {
    text?: boolean;
    image?: boolean;
    video?: boolean;
    audio?: boolean;
    midi?: boolean;
  };
  healthCheck?(): Promise<boolean>;
  costEstimate?(opts: any): Promise<number>;
}
```

## 🤝 Contribuindo

Este é um projeto de demonstração criado para mostrar a capacidade de orquestração de múltiplos provedores de IA. Sinta-se livre para:

- Adicionar novos adapters
- Implementar features do TODO
- Melhorar o UI/UX
- Adicionar testes

## 📝 Licença

MIT

## 🙏 Agradecimentos

- Powered by [Vitorp](https://manus.ai)
- OpenAI, HuggingFace, Stability AI e outros provedores de IA

---

**Chatia-Omni** - Chat de IA Multimodal com Orquestração Inteligente 🚀
