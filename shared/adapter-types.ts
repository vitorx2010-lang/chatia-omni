/**
 * Adapter and orchestrator types for Chatia-Omni
 * These types define the contract between adapters and the orchestrator
 */

/**
 * Provider response type - standardized response from any adapter
 */
export type ProviderResponse = {
  provider: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'midi' | 'multi';
  text?: string;
  html?: string;
  files?: { name: string; url: string; metadata?: any }[];
  sources?: string[];
  raw?: any;
  score?: number;
  error?: string;
  timestamp?: Date;
};

/**
 * Adapter interface - all providers must implement this
 */
export interface IAAdapter {
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

/**
 * Orchestrator options
 */
export interface OrchestratorOptions {
  providers?: string[];
  timeout?: number;
  includeMemory?: boolean;
  maxProviders?: number;
}

/**
 * Combiner prompt context
 */
export interface CombinerContext {
  userMessage: string;
  memoryContext?: string;
  providerResponses: ProviderResponse[];
  language?: string;
}

/**
 * Combined response from orchestrator
 */
export interface CombinedResponse {
  combined: string;
  providerResponses: ProviderResponse[];
  combinerMeta: {
    provider: string;
    timestamp: Date;
    trace: { fragment: string; providers: string[] }[];
  };
  jobId?: number;
}

/**
 * Music generation spec
 */
export interface MusicSpec {
  prompt: string;
  tempo?: number;
  key?: string;
  structure?: string[];
  instruments?: string[];
  lengthSec?: number;
  generateMidi?: boolean;
  generateStems?: boolean;
  generateMaster?: boolean;
  seed?: number;
  randomness?: number;
}

/**
 * Music generation result
 */
export interface MusicResult {
  midiUrl?: string;
  stemsUrls?: { instrument: string; url: string }[];
  masterUrl?: string;
  metadata?: any;
}

/**
 * Voice consent request
 */
export interface VoiceConsentRequest {
  nonce: string;
  instruction: string;
  expiresAt: Date;
}

/**
 * Voice creation request
 */
export interface VoiceCreationRequest {
  voiceSamples: { url: string; mimeType: string }[];
  consentAudio: { url: string; mimeType: string };
  consentMetadata: {
    nonce: string;
    timestamp: Date;
    userAgent?: string;
  };
  name?: string;
}

/**
 * Code generation spec
 */
export interface CodeGenSpec {
  prompt: string;
  stack?: string;
  repoName?: string;
  pushToGitHub?: boolean;
  includeTests?: boolean;
}

/**
 * Code generation result
 */
export interface CodeGenResult {
  zipUrl?: string;
  githubUrl?: string;
  files?: { path: string; content: string }[];
  errors?: string[];
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  categories?: string[];
  confidence?: number;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * File extraction result
 */
export interface FileExtractionResult {
  text?: string;
  metadata?: {
    pages?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    [key: string]: any;
  };
  chunks?: { text: string; index: number }[];
  embeddings?: number[][];
}

/**
 * Vector search result
 */
export interface VectorSearchResult {
  fileId: number;
  chunkIndex: number;
  text: string;
  score: number;
  metadata?: any;
}

/**
 * Provider discovery result
 */
export interface ProviderDiscoveryResult {
  name: string;
  docUrl: string;
  endpoints?: string[];
  supports: {
    text?: boolean;
    image?: boolean;
    video?: boolean;
    audio?: boolean;
    midi?: boolean;
  };
  freeTierNotes?: string;
  authMethod?: string;
  implementable: boolean;
  dateChecked: Date;
}
