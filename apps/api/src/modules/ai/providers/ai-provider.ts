export type AiCompletionInput = {
  system: string;
  user: string;
};

export interface AiProvider {
  complete(input: AiCompletionInput): Promise<{ text: string; model: string }>;
}
