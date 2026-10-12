/**
 * Models visitors can pick from in the chat. Ids are Vercel AI Gateway
 * `provider/model` slugs. The server only accepts ids from this list, so a
 * visitor can never route requests to an expensive model that isn't here.
 *
 * Prices are USD per token (from the gateway's /v1/models) and are used by the
 * server to budget spend per request - update them if you change the list.
 */
export type ChatModel = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  inputPrice: number;
  outputPrice: number;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "google/gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    shortName: "Gemini Flash",
    description: "Quick and well-rounded, the default",
    inputPrice: 0.00000075,
    outputPrice: 0.00000375,
  },
  {
    id: "anthropic/claude-haiku-5.5",
    name: "Claude Haiku 5.5",
    shortName: "Haiku 5.5",
    description: "Fast and light",
    inputPrice: 0.0000001,
    outputPrice: 0.0000005,
  },
  {
    id: "openai/gpt-6-luna",
    name: "GPT-6 Luna",
    shortName: "GPT-6 Luna",
    description: "OpenAI's fast, low-cost model",
    inputPrice: 0.0000001,
    outputPrice: 0.0000005,
  },
  {
    id: "deepseek/deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash",
    shortName: "DeepSeek Flash",
    description: "Efficient and affordable",
    inputPrice: 0.0000003,
    outputPrice: 0.0000012,
  },
  {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    shortName: "Sonnet 5.5",
    description: "Most capable, uses more of the daily limit",
    inputPrice: 0.000002,
    outputPrice: 0.00001,
  },
];

/** The first model in the list is the default. */
export const DEFAULT_CHAT_MODEL_ID = CHAT_MODELS[0].id;

export function findChatModel(id: unknown): ChatModel | undefined {
  return CHAT_MODELS.find((model) => model.id === id);
}
