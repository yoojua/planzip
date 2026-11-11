import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './api-error'
import { request } from './request'

describe('request', () => {
  it('returns the JSON body from a successful API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ status: 'UP', service: 'plan.zip', database: 'UP' }),
    ))

    await expect(request('/api/health')).resolves.toEqual({
      status: 'UP',
      service: 'plan.zip',
      database: 'UP',
    })
  })

  it('preserves the backend error code, field errors and trace identifier', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      code: 'NOT_FOUND',
      message: '요청한 경로를 찾을 수 없습니다.',
      fieldErrors: [],
      traceId: 'trace-123',
    }, { status: 404 })))

    await expect(request('/api/not-found')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: '요청한 경로를 찾을 수 없습니다.',
      traceId: 'trace-123',
    })
  })

  it('handles a non-JSON proxy error as an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      '<html>Bad Gateway</html>', { status: 502 },
    )))

    await expect(request('/api/health')).rejects.toMatchObject({
      status: 502,
      code: 'HTTP_ERROR',
    })
  })

  it('distinguishes a network failure from an HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(request('/api/health')).rejects.toBeInstanceOf(ApiError)
    await expect(request('/api/health')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    })
  })
})
