import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { getRedis } from '../config/redis';

export type LLMProvider = 'openai' | 'gemini';

export interface LLMResult {
  data: Record<string, unknown>;
  provider: LLMProvider;
}

const CACHE_TTL_SECONDS = 3600;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const DEFAULT_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

function envFlag(name: string): boolean {
  const value = process.env[name] ?? process.env[name.toLowerCase()];
  return value?.toLowerCase() === 'true' || value === '1';
}

function getGeminiModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  const fromEnv = configured
    ? configured.split(',').map((m) => m.trim()).filter(Boolean)
    : [];
  const merged = [...fromEnv, ...DEFAULT_GEMINI_MODELS];
  return [...new Set(merged)];
}

function formatProviderError(provider: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.includes('quota')) {
    if (provider === 'openai') {
      return 'OpenAI quota exceeded — add billing at platform.openai.com or set SKIP_OPENAI=true';
    }
    return 'Gemini quota exceeded — wait a minute and retry, or try GEMINI_MODEL=gemini-2.5-flash';
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return `Gemini model unavailable — use GEMINI_MODEL=gemini-2.5-flash (not gemini-1.5-flash). Details: ${msg.slice(0, 200)}`;
  }
  return msg.length > 300 ? `${msg.slice(0, 300)}...` : msg;
}

class LLMService {
  private openai: OpenAI | null;
  private gemini: GoogleGenerativeAI | null;
  private openaiTimeout: number;
  private geminiTimeout: number;
  private skipOpenAI: boolean;
  private geminiModels: string[];

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    this.skipOpenAI = envFlag('SKIP_OPENAI') || !openaiKey;
    this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
    this.gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
    this.openaiTimeout = parseInt(process.env.OPENAI_TIMEOUT_MS || '30000', 10);
    this.geminiTimeout = parseInt(process.env.GEMINI_TIMEOUT_MS || '30000', 10);
    this.geminiModels = getGeminiModelCandidates();
  }

  async generateQuestions(
    prompt: string,
    onFallback?: (from: LLMProvider, to: LLMProvider, reason: string) => void,
    bypassCache = false
  ): Promise<LLMResult> {
    const cacheKey = `llm:cache:${crypto.createHash('sha256').update(prompt).digest('hex')}`;
    const redis = getRedis();
    const cached = bypassCache ? null : await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as LLMResult;
      console.log(`LLM cache hit (${parsed.provider})`);
      return parsed;
    }

    let openaiReason = 'Skipped (no API key or SKIP_OPENAI=true)';

    if (!this.skipOpenAI && this.openai) {
      try {
        console.log('Trying OpenAI GPT-3.5-turbo...');
        const result = await this.callOpenAI(prompt);
        const data = this.parseResponse(result);
        const llmResult: LLMResult = { data, provider: 'openai' };
        await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(llmResult));
        return llmResult;
      } catch (openaiError) {
        openaiReason = formatProviderError('openai', openaiError);
        console.log('OpenAI failed, falling back to Gemini:', openaiReason);
        onFallback?.('openai', 'gemini', openaiReason);
      }
    } else {
      console.log('Skipping OpenAI:', openaiReason);
    }

    if (!this.gemini) {
      throw new Error(
        `No working LLM available. OpenAI: ${openaiReason}. Gemini: GEMINI_API_KEY not set in backend/.env`
      );
    }

    try {
      const result = await this.callGemini(prompt);
      const data = this.parseResponse(result);
      const llmResult: LLMResult = { data, provider: 'gemini' };
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(llmResult));
      return llmResult;
    } catch (geminiError) {
      const geminiReason = formatProviderError('gemini', geminiError);
      console.log('Gemini failed:', geminiReason);
      throw new Error(`Both LLM providers failed. OpenAI: ${openaiReason}. Gemini: ${geminiReason}`);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not configured');
    const response = await withTimeout(
      this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
      this.openaiTimeout,
      'OpenAI'
    );
    return response.choices[0]?.message?.content || '';
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.gemini) throw new Error('Gemini not configured');

    const errors: string[] = [];

    for (const modelName of this.geminiModels) {
      try {
        console.log(`Trying Gemini (${modelName})...`);
        const model = this.gemini.getGenerativeModel({ model: modelName });
        const result = await withTimeout(
          model.generateContent(prompt),
          this.geminiTimeout,
          `Gemini ${modelName}`
        );
        const response = await result.response;
        const text = response.text();
        console.log(`Gemini succeeded with model: ${modelName}`);
        return text;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${modelName}: ${msg}`);
        console.log(`Gemini model ${modelName} failed:`, msg);
      }
    }

    throw new Error(errors.join(' | '));
  }

  private parseResponse(response: string): Record<string, unknown> {
    let jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}') + 1;
    if (start === -1 || end <= start) {
      throw new Error('No valid JSON found in LLM response');
    }
    jsonStr = jsonStr.slice(start, end);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  }
}

export const llmService = new LLMService();
