/**
 * Fetch wrapper that never lets a non-JSON response (HTML error page, empty
 * body, etc.) surface a raw parser error like `Unexpected token '<'...` to
 * the user — it always resolves to a friendly message instead.
 */
export async function safeFetchJson<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let res: Response
  try {
    res = await fetch(input, init)
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.')
  }

  const raw = await res.text()
  let json: unknown = null
  if (raw) {
    try {
      json = JSON.parse(raw)
    } catch {
      throw new Error('Something went wrong. Please try again.')
    }
  }

  if (!res.ok) {
    const message = (json as { error?: string } | null)?.error
    throw new Error(message || 'Something went wrong. Please try again.')
  }

  return (json ?? {}) as T
}
