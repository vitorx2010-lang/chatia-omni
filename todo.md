# Chatia-Omni TODO

## Database & Types
- [ ] Criar schema completo (conversations, messages, files, voices, jobs, providers)
- [ ] Definir tipos compartilhados (ProviderResponse, IAAdapter, etc)
- [ ] Configurar vector DB para embeddings

## Adapters de Provedores
- [ ] Implementar adapter base com interface padrão
- [ ] Criar adapters de texto (OpenAI, Gemini, HuggingFace)
- [ ] Criar adapters de imagem (Stability, DALL-E, Replicate)
- [ ] Criar adapters de música (MusicGen, Mubert, Audiocraft)
- [ ] Criar adapters de voz (ElevenLabs, Resemble)
- [ ] Criar placeholders para vídeo (Runway, Pika)

## Orchestrator & Combiner
- [ ] Implementar orchestrator que chama adapters em paralelo
- [ ] Criar Combiner LLM para unificar respostas
- [ ] Adicionar normalização de respostas
- [ ] Implementar timeout e retry logic

## API Endpoints - Chat & Conversations
- [ ] POST /api/chat - orquestração principal
- [ ] GET /api/chat/:jobId/status
- [ ] GET /api/conversations - listar conversas
- [ ] GET /api/conversations/:id - detalhes
- [ ] POST /api/conversations - criar
- [ ] DELETE /api/conversations/:id - deletar

## Memory System
- [ ] POST /api/conversations/:id/memory/enable
- [ ] POST /api/conversations/:id/memory/disable
- [ ] GET /api/conversations/:id/memory
- [ ] DELETE /api/conversations/:id/memory
- [ ] Implementar summarization automática
- [ ] Integrar embeddings no vector DB

## Files & RAG
- [ ] POST /api/files/upload - upload multipart
- [ ] Extração de texto (PDF, DOCX, OCR)
- [ ] Transcrição de áudio (Whisper)
- [ ] Extração de keyframes de vídeo
- [ ] Chunking com overlap
- [ ] Indexação no vector DB
- [ ] GET /api/files/:id
- [ ] DELETE /api/files/:id

## Media Generation
- [ ] POST /api/media/image - geração de imagens
- [ ] POST /api/media/video - geração de vídeos
- [ ] GET /api/media/video/:jobId/status
- [ ] GET /api/media/video/:jobId/result

## Music Generation
- [ ] POST /api/music/create - criar música
- [ ] GET /api/music/:jobId/status
- [ ] GET /api/music/:jobId/result - ZIP com MIDI/stems/master
- [ ] POST /api/music/:jobId/variation - criar variações
- [ ] Pipeline completo: MIDI + stems + master

## Voice Synthesis (Consent Flow)
- [ ] POST /api/voice/request-consent - iniciar consent
- [ ] POST /api/voice/create - criar voice com validação
- [ ] Validação de nonce via ASR
- [ ] GET /api/voice/:voiceId/status
- [ ] POST /api/voice/:voiceId/revoke
- [ ] POST /api/voice/generate - TTS com watermark
- [ ] GET /api/voice/:jobId/status
- [ ] GET /api/voice/:jobId/result

## Code Generation
- [ ] POST /api/code/generate - gerar projeto
- [ ] Planner LLM para decomposição
- [ ] Codegen paralelo
- [ ] TypeScript compile + ESLint
- [ ] GET /api/code/:jobId/status
- [ ] GET /api/code/:jobId/result - ZIP ou GitHub
- [ ] Security checks (malware, crypto-mining)

## Admin
- [ ] GET /api/admin/providers - status
- [ ] POST /api/admin/provider/:name/enable
- [ ] POST /api/admin/provider/:name/disable
- [ ] GET /api/admin/logs - audit logs

## Security & Safety
- [ ] Implementar safetyCheck para conteúdo
- [ ] Rate limits por usuário/plano
- [ ] Quotas configuráveis
- [ ] PII sanitization
- [ ] Audit logging
- [ ] Filtros de conteúdo ilícito

## Frontend - Auth & Dashboard
- [ ] Página de login com NextAuth
- [ ] Dashboard com usage e cost estimates
- [ ] Botões: New Chat, New Music, New Project, Upload

## Frontend - Chat UI
- [ ] Message composer (text, files, audio)
- [ ] Provider badges
- [ ] Memory toggle ON/OFF
- [ ] Combined response + expand per-provider
- [ ] Citations list
- [ ] Actions: Regenerate, Fork, Export JSON

## Frontend - Music Composer
- [ ] Form completo (tempo, key, structure, instruments)
- [ ] Timeline com sections
- [ ] Loop/preview player
- [ ] Mute/solo stems
- [ ] Variation/remix buttons

## Frontend - Media Pages
- [ ] Image editor/inpainting modal
- [ ] Video storyboarder
- [ ] Voice consent flow modal
- [ ] Sample library manager

## Frontend - Admin UI
- [ ] Providers list com health status
- [ ] Enable/disable providers
- [ ] Logs viewer
- [ ] Quota overrides
- [ ] Manual review queue

## Testing
- [ ] Unit tests (orchestrator, safetyCheck, adapters)
- [ ] Integration tests (API flows)
- [ ] E2E smoke tests (chat, music, voice, files, codegen)

## Documentation
- [ ] README.md completo
- [ ] docs/providers-detected.md
- [ ] docs/architecture.md
- [ ] docs/privacy.md
- [ ] docs/terms.md
- [ ] reports/integration-report.md
- [ ] .env.example com todas as variáveis


## Itens Completados (Fase 1)
- [x] Criar schema completo do banco de dados
- [x] Definir tipos compartilhados (ProviderResponse, IAAdapter, etc)
- [x] Implementar adapter base com interface padrão
- [x] Criar adapters de texto (OpenAI, HuggingFace)
- [x] Criar adapters de imagem (Stability)
- [x] Criar placeholders para vídeo (Runway, Pika, Replicate)
- [x] Implementar orchestrator que chama adapters em paralelo
- [x] Criar Combiner LLM para unificar respostas
- [x] Adicionar normalização de respostas
- [x] Implementar timeout e retry logic
- [x] POST /api/chat - orquestração principal (via tRPC)
- [x] GET /api/conversations - listar conversas (via tRPC)
- [x] GET /api/conversations/:id - detalhes (via tRPC)
- [x] DELETE /api/conversations/:id - deletar (via tRPC)
- [x] GET /api/admin/providers - status (via tRPC)
- [x] POST /api/admin/provider/:name/enable (via tRPC)
- [x] POST /api/admin/provider/:name/disable (via tRPC)
- [x] Página de login com NextAuth
- [x] Dashboard/Landing page com features
- [x] Chat UI completa com provider badges
- [x] Admin UI para gerenciar providers
