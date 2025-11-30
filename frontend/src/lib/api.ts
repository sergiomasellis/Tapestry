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

// Password reset functions
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to request password reset" }));
    throw new Error(error.detail || "Failed to request password reset");
  }
  
  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to reset password" }));
    throw new Error(error.detail || "Failed to reset password");
  }
  
  return response.json();
}

// QR Code login functions
export async function generateQRCodeSession(): Promise<{ session_token: string; expires_at: string; qr_code_url: string }> {
  const response = await apiFetch("/auth/qr-code/generate", {
    method: "POST",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to generate QR code session" }));
    throw new Error(error.detail || "Failed to generate QR code session");
  }
  
  return response.json();
}

export async function checkQRCodeStatus(sessionToken: string): Promise<{ status: "pending" | "scanned" | "expired"; access_token?: string }> {
  const response = await apiFetch(`/auth/qr-code/status/${sessionToken}`, {
    method: "GET",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to check QR code status" }));
    throw new Error(error.detail || "Failed to check QR code status");
  }
  
  return response.json();
}




