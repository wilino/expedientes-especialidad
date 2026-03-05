export interface ApiError extends Error {
  status: number;
  payload?: unknown;
}

export async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function buildApiError(
  status: number,
  payload: unknown,
  fallbackMessage: string,
): ApiError {
  const message = extractErrorMessage(payload) ?? fallbackMessage;
  const error = new Error(message) as ApiError;
  error.status = status;
  error.payload = payload;
  return error;
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  if ('message' in payload) {
    const message = payload.message;
    if (typeof message === 'string') {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.length > 0 &&
      typeof message[0] === 'string'
    ) {
      return message[0];
    }
  }

  return null;
}
