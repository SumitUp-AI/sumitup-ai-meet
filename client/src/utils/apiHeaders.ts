export const getTenantHeaders = (tenantId?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (tenantId) {
    headers["X-Tenant-ID"] = tenantId;
  }

  return headers;
};

export const getAuthHeaders = (token: string, tenantId?: string): HeadersInit => {
  return {
    ...getTenantHeaders(tenantId),
    Authorization: `Bearer ${token}`,
  };
};
