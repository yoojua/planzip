import { ApiError } from './api-error'
import type { ErrorResponse, FieldError } from './api-error'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string'
}

function readError(data: unknown, status: number): ErrorResponse {
  if (isRecord(data) && typeof data.code === 'string' && typeof data.message === 'string') {
    return {
      code: data.code,
      message: data.message,
      fieldErrors: Array.isArray(data.fieldErrors) ? data.fieldErrors.filter(isFieldError) : [],
      traceId: typeof data.traceId === 'string' ? data.traceId : undefined,
    }
  }

  return {
    code: 'HTTP_ERROR',
    message: '요청을 처리하지 못했습니다. (HTTP ' + status + ')',
    fieldErrors: [],
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(path, { ...options, headers })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: '서버에 연결하지 못했습니다. 서버 실행 상태를 확인해 주세요.',
      fieldErrors: [],
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, readError(undefined, response.status))
    }

    throw new ApiError(response.status, {
      code: 'INVALID_RESPONSE',
      message: '서버 응답을 읽지 못했습니다. 응답 형식을 확인해 주세요.',
      fieldErrors: [],
    })
  }

  if (!response.ok) {
    throw new ApiError(response.status, readError(data, response.status))
  }

  return data as T
}
