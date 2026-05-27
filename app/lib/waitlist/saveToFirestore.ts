import type { WaitlistInput as WaitlistData } from './types';

export async function saveToWaitlist(
  data: WaitlistData,
): Promise<{ success: boolean; message: string; duplicate?: boolean; id?: string }> {
  try {
    const res = await fetch('/api/waitlist/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        region: data.region,
        role: data.role,
        source: data.source,
        userAgent: data.userAgent,
      }),
    });

    const result = (await res.json()) as {
      success?: boolean;
      message?: string;
      duplicate?: boolean;
      id?: string;
      error?: string;
    };

    if (res.status === 429) {
      return {
        success: false,
        message: result.message || 'Too many attempts. Please try again later.',
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: result.message || result.error || 'Something went wrong. Please try again later.',
      };
    }

    return {
      success: result.success ?? true,
      message: result.message || 'Successfully joined the waitlist!',
      duplicate: result.duplicate,
      id: result.id,
    };
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
