import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConnectionCheckPage } from './connection-check-page'

describe('ConnectionCheckPage', () => {
  it('displays server and database status after a successful check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ status: 'UP', service: 'plan.zip', database: 'UP' }),
    ))
    render(<ConnectionCheckPage />)

    await userEvent.click(screen.getByRole('button', { name: '서버 연결 확인' }))

    expect(await screen.findByText('서버에 연결되었습니다.')).not.toBeNull()
    expect(screen.getAllByText('UP')).toHaveLength(2)
  })

  it('displays the structured error from the error check endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({
      code: 'NOT_FOUND',
      message: '요청한 경로를 찾을 수 없습니다.',
      fieldErrors: [],
      traceId: 'test-trace',
    }, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<ConnectionCheckPage />)

    await userEvent.click(screen.getByRole('button', { name: '오류 응답 확인' }))

    expect(await screen.findByRole('alert')).not.toBeNull()
    expect(screen.getByText('NOT_FOUND')).not.toBeNull()
    expect(screen.getByText('test-trace')).not.toBeNull()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/not-found')
  })

  it('blocks repeated checks until the current request has completed', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    const fetchMock = vi.fn().mockReturnValue(response)
    vi.stubGlobal('fetch', fetchMock)
    render(<ConnectionCheckPage />)
    const button = screen.getByRole('button', { name: '서버 연결 확인' }) as HTMLButtonElement

    await userEvent.click(button)

    expect(screen.getByRole('status').textContent).toContain('기다리고')
    expect(button.disabled).toBe(true)
    await userEvent.click(button)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    completeRequest(Response.json({ status: 'UP', service: 'plan.zip', database: 'UP' }))
    await screen.findByText('서버에 연결되었습니다.')
    await waitFor(() => expect(button.disabled).toBe(false))
  })
})
