export type DocumentState =
  | "STATE_UNSPECIFIED"
  | "STATE_PENDING"
  | "STATE_ACTIVE"
  | "STATE_FAILED";

export interface CustomMetadata {
  key: string;
  stringValue?: string;
  numericValue?: number;
}

export interface FileSearchStore {
  name: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
  activeDocumentsCount?: string;
  pendingDocumentsCount?: string;
  failedDocumentsCount?: string;
  sizeBytes?: string;
}

export interface FileSearchDocument {
  name: string;
  displayName?: string;
  customMetadata?: CustomMetadata[];
  updateTime?: string;
  createTime?: string;
  state?: DocumentState;
  sizeBytes?: string;
  mimeType?: string;
}

export interface Operation {
  name: string;
  metadata?: Record<string, unknown>;
  done: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: Record<string, unknown>;
}

export interface ChunkingConfig {
  maxTokensPerChunk?: number;
  maxOverlapTokens?: number;
}

export interface UploadConfig {
  displayName?: string;
  chunkingConfig?: ChunkingConfig;
  customMetadata?: CustomMetadata[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: GroundingChunk[];
}

export interface GroundingChunk {
  retrievedContext?: {
    uri?: string;
    title?: string;
    text?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: Array<{
    segment?: {
      startIndex?: number;
      endIndex?: number;
      text?: string;
    };
    groundingChunkIndices?: number[];
    confidenceScores?: number[];
  }>;
}

export interface ChatRequest {
  storeId: string;
  messages: ChatMessage[];
  model?: string;
  metadataFilter?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  groundingMetadata?: GroundingMetadata;
}
