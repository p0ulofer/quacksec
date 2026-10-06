export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não definida — configure-a nas variáveis de ambiente (Vercel)."
    );
  }
  return url;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; *)${name}=([^;]*)`));
  return match?.[1];
}

function setTokenCookies(accessToken: string, refreshToken: string) {
  document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
}

function clearTokenCookies() {
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "refresh_token=; path=/; max-age=0";
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });
    if (!response.ok) return false;

    const data = await response.json();
    if (!data.accessToken || !data.refreshToken) return false;

    setTokenCookies(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export interface Scan {
  id: string;
  targetUrl: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  modules: string[];
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  routesTested: number;
  securityScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  vulnerabilities?: Vulnerability[];
  dependencies?: Dependency[];
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "open" | "confirmed" | "false_positive" | "fixed";
  confidence: "high" | "medium" | "low";
  module: string;
  source?: string;
  affectedEndpoint: string;
  evidence: string;
  recommendation: string;
  cveIds: string[];
  cweId: string;
  scanId: string;
  createdAt: string;
}

export interface Dependency {
  id: string;
  name: string;
  detectedVersion: string;
  confidence: "high" | "medium" | "low";
  latestVersion: string | null;
  detectionMethod: string;
  scanId: string;
  createdAt: string;
}

export interface ScannedUrl {
  applicationId: string | null;
  url: string;
  name: string | null;
  scanCount: number;
}

export interface RemediationPlanVuln {
  id: string;
  vulnerabilityId: string;
  status: "pending" | "resolved" | "false_positive" | "risk_accepted";
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  vulnerability: Vulnerability;
}

export interface RemediationPlan {
  id: string;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "done";
  createdById: string;
  assignedToId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vulnerabilities: RemediationPlanVuln[];
  createdBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string } | null;
}

export interface DashboardStats {
  totalScans: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  securityScore: number;
}

function getToken(): string | undefined {
  return getCookie("access_token");
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${getApiUrl()}${endpoint}`;

    let token = getToken();
    if (!token) {
      token = (await refreshSession()) ? getToken() : undefined;
    }

    const send = (accessToken?: string): Promise<Response> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return fetch(url, { ...options, headers, credentials: "include" });
    };

    let response = await send(token);

    if (response.status === 401 && (await refreshSession())) {
      response = await send(getToken());
    }

    if (response.status === 401) {
      clearTokenCookies();
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  async createScan(targetUrl: string, modules?: string[], applicationId?: string): Promise<Scan> {
    return this.request<Scan>("/scans", {
      method: "POST",
      body: JSON.stringify({ targetUrl, modules, applicationId }),
    });
  }

  async getScans(): Promise<Scan[]> {
    return this.request<Scan[]>("/scans");
  }

  async getScan(id: string): Promise<Scan> {
    return this.request<Scan>(`/scans/${id}`);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/scans/dashboard");
  }

  async getVulnerabilities(filters?: {
    severity?: string;
    status?: string;
    search?: string;
    applicationId?: string;
    module?: string;
    urgent?: boolean;
  }): Promise<Vulnerability[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.applicationId) params.append("applicationId", filters.applicationId);
    if (filters?.module) params.append("module", filters.module);
    if (filters?.urgent) params.append("urgent", "true");

    const query = params.toString();
    return this.request<Vulnerability[]>(`/vulnerabilities${query ? `?${query}` : ""}`);
  }

  async getVulnerability(id: string): Promise<Vulnerability> {
    return this.request<Vulnerability>(`/vulnerabilities/${id}`);
  }

  async updateVulnerabilityStatus(id: string, status: string): Promise<Vulnerability> {
    return this.request<Vulnerability>(`/vulnerabilities/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getDependencies(scanId: string): Promise<Dependency[]> {
    return this.request<Dependency[]>(`/dependencies/scan/${scanId}`);
  }

  async getScannedUrls(): Promise<ScannedUrl[]> {
    return this.request<ScannedUrl[]>("/applications/scanned-urls");
  }

  async deleteAccount(password: string): Promise<void> {
    await this.request<{ message: string }>("/users/me", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  }

  async createRemediationPlan(data: {
    title: string;
    description?: string;
    vulnerabilityIds: string[];
    assignedToId?: string;
    dueDate?: string;
  }): Promise<RemediationPlan> {
    return this.request<RemediationPlan>("/remediation-plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRemediationPlans(): Promise<RemediationPlan[]> {
    return this.request<RemediationPlan[]>("/remediation-plans");
  }

  async getRemediationPlan(id: string): Promise<RemediationPlan> {
    return this.request<RemediationPlan>(`/remediation-plans/${id}`);
  }

  async updateRemediationPlan(
    id: string,
    data: { title?: string; description?: string; status?: string; dueDate?: string }
  ): Promise<RemediationPlan> {
    return this.request<RemediationPlan>(`/remediation-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updatePlanVulnerabilityStatus(
    planId: string,
    vulnId: string,
    data: { status: string; resolutionNote?: string }
  ): Promise<RemediationPlan> {
    return this.request<RemediationPlan>(
      `/remediation-plans/${planId}/vulnerabilities/${vulnId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteRemediationPlan(id: string): Promise<void> {
    await this.request<{ message: string }>(`/remediation-plans/${id}`, {
      method: "DELETE",
    });
  }

  
}

export const api = new ApiClient();
