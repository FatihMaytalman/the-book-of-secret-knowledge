export interface ImmichAsset {
  id: string;
  originalFileName: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER';
  fileCreatedAt?: string;
  updatedAt?: string;
  checksum?: string;
  exifInfo?: {
    fileSizeInByte?: number;
  };
}

export interface ImmichSearchResult {
  assets: ImmichAsset[];
  total: number;
}

interface ImmichSearchResponse {
  assets?: {
    items?: ImmichAsset[];
    total?: number;
  };
}

export class ImmichClientError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ImmichClientError';
  }
}

export class ImmichClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  isConfigured(): boolean {
    return this.baseUrl.length > 0 && this.apiKey.length > 0;
  }

  async searchAssets(updatedAfter?: Date): Promise<ImmichSearchResult> {
    const body: Record<string, string> = {};
    if (updatedAfter) {
      body.updatedAfter = updatedAfter.toISOString();
    }

    const response = await this.request<ImmichSearchResponse>('/api/search/metadata', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const items = response.assets?.items ?? [];
    return {
      assets: items,
      total: response.assets?.total ?? items.length,
    };
  }

  async downloadOriginal(assetId: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/assets/${assetId}/original`, {
      headers: {
        Accept: '*/*',
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new ImmichClientError(
        `Failed to download Immich asset ${assetId}: ${response.status}`,
        response.status,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new ImmichClientError(
        `Immich request failed for ${path}: ${response.status}`,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }
}
