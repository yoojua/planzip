import { request } from '@/shared/api'

export interface HealthResponse {
  status: string
  service: string
  database: string
}

export function checkHealth() {
  return request<HealthResponse>('/api/health')
}

export function checkErrorResponse() {
  return request<unknown>('/api/not-found')
}
