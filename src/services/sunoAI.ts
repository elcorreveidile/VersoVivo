/**
 * Suno AI Music Generation Service
 */

import axios from 'axios';
import { SUNO_AI_API_KEY, SUNO_AI_API_URL, API_TIMEOUT } from '@env';
import type { MusicGenerationRequest, MusicGenerationResponse } from '@types/index';

class SunoAIService {
  private apiUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.apiUrl = SUNO_AI_API_URL || 'https://api.suno.ai/v1';
    this.apiKey = SUNO_AI_API_KEY;
    this.timeout = parseInt(API_TIMEOUT || '30000', 10);
  }

  /**
   * Generate music for a poem
   */
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/generate-music`,
        {
          prompt: request.prompt,
          duration: request.duration,
          style: request.style || 'ambient',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      return {
        musicUrl: response.data.musicUrl,
        status: response.data.status || 'success',
        jobId: response.data.jobId,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('Error generating music:', error);
      return {
        musicUrl: '',
        status: 'error',
        message: error.response?.data?.message || 'Error al generar música',
      };
    }
  }

  /**
   * Check music generation status
   */
  async checkStatus(jobId: string): Promise<MusicGenerationResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: this.timeout,
      });

      return {
        musicUrl: response.data.musicUrl || '',
        status: response.data.status,
        jobId: response.data.jobId,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('Error checking status:', error);
      return {
        musicUrl: '',
        status: 'error',
        message: 'Error al verificar el estado',
      };
    }
  }

  /**
   * Generate music prompt from poem content
   */
  generatePromptFromPoem(poemTitle: string, poemContent: string, theme: string): string {
    // Analyze poem to create music prompt
    const themeStyles: Record<string, string> = {
      amor: 'romántico, piano suave, cuerdas emotivas',
      naturaleza: 'ambiente natural, sonidos de la naturaleza, guitarra acústica',
      existencia: 'filosófico, minimalista, ambient',
      melancolía: 'melancólico, piano, violín triste',
      esperanza: 'inspirador, orquesta suave, crescendo optimista',
      tiempo: 'contemplativo, reloj, ambient',
      soledad: 'solitario, piano solo, ecos',
      otros: 'instrumental, ambiente suave',
    };

    const style = themeStyles[theme] || themeStyles.otros;

    return `Música instrumental ${style} inspirada en el poema "${poemTitle}". Debe evocar las emociones del texto sin letra, con una atmósfera contemplativa y poética.`;
  }

  /**
   * Generate music with automatic retry
   */
  async generateMusicWithRetry(
    request: MusicGenerationRequest,
    maxRetries: number = 3
  ): Promise<MusicGenerationResponse> {
    let lastError: MusicGenerationResponse | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.generateMusic(request);

      if (result.status === 'success' || result.status === 'processing') {
        return result;
      }

      lastError = result;

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return lastError || {
      musicUrl: '',
      status: 'error',
      message: 'Error después de múltiples intentos',
    };
  }
}

export default new SunoAIService();
