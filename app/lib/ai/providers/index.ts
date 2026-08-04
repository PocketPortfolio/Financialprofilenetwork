export {
  type AskAiProviderMode,
  OLLAMA_MODEL_LLAMA31,
  OLLAMA_MODEL_DEEPSEEK_R1,
  OLLAMA_MODEL_QWEN_CODER,
  LOCAL_CONTEXT_MAX_CHARS,
  PROVIDER_MODE_LABELS,
  PROVIDER_MODE_BADGE,
  isLocalProviderMode,
  modelIdForProviderMode,
  getOllamaBaseUrl,
  getServerOllamaBaseUrl,
  isLocalAiUiEnabled,
  isOllamaClientDirectEnabled,
} from './types';
export { truncatePortfolioContextForLocal } from './truncateContext';
export {
  checkOllamaHealth,
  streamOllamaChat,
  createOllamaPlainTextStream,
  LOCAL_ASK_AI_SYSTEM_PREAMBLE,
} from './ollama';
