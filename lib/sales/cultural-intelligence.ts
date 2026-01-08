/**
 * Cultural Intelligence: Detect language, region, and cultural context
 * Sprint 4: Humanity & Precision Upgrade
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CulturalContext {
  detectedLanguage: string; // ISO 639-1 code (e.g., "en", "zh", "de")
  detectedRegion: string; // ISO 3166-1 alpha-2 (e.g., "CN", "BR", "DE")
  confidence: number; // 0-100
  culturalPrompt: string; // Instructions for AI on how to communicate
  greeting: string; // Appropriate greeting
}

const CULTURAL_PROMPTS: Record<string, string> = {
  'CN': `Use formal Mandarin. Focus on:
- Trust and partnership (信任, 合作)
- Harmony and mutual benefit (和谐, 互利)
- Respect for hierarchy
- Avoid direct sales pressure - frame as partnership opportunity`,

  'BR': `Use warm Portuguese. Focus on:
- Community and relationship (comunidade, relacionamento)
- Personal connection before business
- Enthusiasm and optimism
- Frame as collaborative opportunity`,

  'DE': `Use formal German. Focus on:
- Precision and efficiency (Präzision, Effizienz)
- Security and data privacy (Sicherheit, Datenschutz)
- Technical accuracy
- Direct but respectful communication`,

  'JP': `Use formal Japanese. Focus on:
- Respect and humility (尊敬, 謙虚)
- Long-term relationship (長期的な関係)
- Group harmony
- Indirect communication style`,

  'FR': `Use formal French. Focus on:
- Elegance and sophistication
- Technical excellence
- Data sovereignty (souveraineté des données)
- Respectful, professional tone`,

  'ES': `Use formal Spanish. Focus on:
- Personal connection
- Respect and formality
- Community values
- Professional but warm tone`,

  'US': `Use professional English. Focus on:
- Direct value proposition
- Technical accuracy
- Efficiency and results
- Clear, concise communication`,

  'GB': `Use professional British English. Focus on:
- Understated professionalism
- Technical excellence
- Data privacy and sovereignty
- Respectful, measured tone`,
};

export async function detectCultureAndLanguage(
  firstName?: string,
  lastName?: string,
  companyName?: string,
  location?: string
): Promise<CulturalContext> {
  const prompt = `Analyze the following lead information and detect:
1. Most likely language (ISO 639-1 code)
2. Most likely region/country (ISO 3166-1 alpha-2)
3. Confidence level (0-100)

Lead Info:
- Name: ${firstName || ''} ${lastName || ''}
- Company: ${companyName || ''}
- Location: ${location || ''}

Respond in JSON format only:
{
  "detectedLanguage": "en",
  "detectedRegion": "US",
  "confidence": 85,
  "reasoning": "Name suggests English-speaking region, company location indicates US"
}`;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'), // Use cheaper model for detection
      prompt,
      temperature: 0.3, // Lower temperature for more consistent detection
    });

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const region = parsed.detectedRegion || 'US';
    const language = parsed.detectedLanguage || 'en';
    
    return {
      detectedLanguage: language,
      detectedRegion: region,
      confidence: parsed.confidence || 50,
      culturalPrompt: CULTURAL_PROMPTS[region] || CULTURAL_PROMPTS['US'] || '',
      greeting: getGreeting(language, region),
    };
  } catch (error: any) {
    console.error('Cultural detection error:', error.message);
    // Fallback to English
    return {
      detectedLanguage: 'en',
      detectedRegion: 'US',
      confidence: 0,
      culturalPrompt: CULTURAL_PROMPTS['US'] || '',
      greeting: 'Hi',
    };
  }
}

function getGreeting(language: string, region: string): string {
  const greetings: Record<string, string> = {
    'zh': '您好', // Chinese
    'de': 'Guten Tag', // German
    'pt': 'Olá', // Portuguese
    'ja': 'こんにちは', // Japanese
    'fr': 'Bonjour', // French
    'es': 'Hola', // Spanish
    'ko': '안녕하세요', // Korean
    'it': 'Buongiorno', // Italian
    'ru': 'Здравствуйте', // Russian
    'ar': 'مرحبا', // Arabic
  };
  
  return greetings[language] || 'Hi';
}

/**
 * Get cultural prompt for a specific region
 */
export function getCulturalPrompt(region: string): string {
  return CULTURAL_PROMPTS[region] || CULTURAL_PROMPTS['US'] || '';
}

