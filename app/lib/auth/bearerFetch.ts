/**
 * Client helper: attach Firebase ID token to API fetches (admin / owner routes).
 */
export async function bearerFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  getIdToken: () => Promise<string>
): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
