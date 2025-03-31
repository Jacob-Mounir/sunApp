import { QueryClient, QueryFunction } from "@tanstack/react-query";
import config from "../config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: FormData | string;
    headers?: Record<string, string>;
  } = {}
): Promise<any> {
  const { method = 'GET', body, headers = {} } = options;

  // Don't set Content-Type for FormData, let the browser handle it
  if (!(body instanceof FormData) && body) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure the URL uses the API base URL if it's a relative URL
  const fullUrl = url.startsWith('/')
    ? `${config.apiBaseUrl}${url.substring(4)}` // Remove the /api prefix
    : url;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  // Try to parse as JSON, fall back to text if not JSON
  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const urlKey = queryKey[0] as string;

      // Ensure the URL uses the API base URL if it's an API URL
      const fullUrl = urlKey.startsWith('/api/')
        ? `${config.apiBaseUrl}${urlKey.substring(4)}` // Remove the /api prefix
        : urlKey;

      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
