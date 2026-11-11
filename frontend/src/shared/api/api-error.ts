export interface FieldError {
  field: string
  message: string
}

export interface ErrorResponse {
  code: string
  message: string
  fieldErrors: FieldError[]
  traceId?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldError[]
  readonly traceId?: string

  constructor(status: number, response: ErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.status = status
    this.code = response.code
    this.fieldErrors = response.fieldErrors
    this.traceId = response.traceId
  }
}
