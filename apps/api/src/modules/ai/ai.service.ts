import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiHealthStatus {
  status: 'ok' | 'unconfigured' | 'error';
  provider: 'anthropic';
  model: string;
  message: string;
}

export interface HeritageAssistRequest {
  prompt: string;
  familyContext?: string;
}

export interface HeritageAssistResponse {
  answer: string;
  model: string;
  provider: 'anthropic';
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
}

@Injectable()
export class AiService {
  private readonly model = 'claude-sonnet-4-20250514';

  constructor(private readonly config: ConfigService) {}

  getHealth(): AiHealthStatus {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        status: 'unconfigured',
        provider: 'anthropic',
        model: this.model,
        message: 'Set ANTHROPIC_API_KEY to enable Claude heritage assistance.',
      };
    }

    return {
      status: 'ok',
      provider: 'anthropic',
      model: this.model,
      message: 'Claude heritage assistant is configured.',
    };
  }

  async assist(request: HeritageAssistRequest): Promise<HeritageAssistResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Claude AI is not configured. Add ANTHROPIC_API_KEY to the API environment.',
      );
    }

    const systemPrompt = [
      'You are a careful heritage assistant for the AOM Legacy Family Tree platform.',
      'Help families preserve stories, understand genealogy context, and draft respectful summaries.',
      'Never invent sensitive facts. Prefer questions and caveats when information is missing.',
      request.familyContext ? `Family context: ${request.familyContext}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ServiceUnavailableException(
        `Claude request failed (${response.status}): ${errorBody.slice(0, 240)}`,
      );
    }

    const payload = (await response.json()) as AnthropicMessageResponse;
    const answer =
      payload.content?.find((block) => block.type === 'text')?.text?.trim() ??
      'Claude returned an empty response.';

    return {
      answer,
      model: this.model,
      provider: 'anthropic',
    };
  }

  private getApiKey(): string | undefined {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim();
    return apiKey || undefined;
  }
}
