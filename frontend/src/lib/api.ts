// Get API base URL - called at runtime to use correct hostname
function getApiBase(): string {
  // If explicitly set, use the env variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // On the client, use the same hostname as the current page but on port 8000
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000/api`;
  }
  
  // Server-side fallback
  return "http://localhost:8000/api";
}

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const apiBase = getApiBase(); // Evaluate at runtime, not module load
  const headers = getAuthHeaders();
  
  const response = await fetch(`${apiBase}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
}




