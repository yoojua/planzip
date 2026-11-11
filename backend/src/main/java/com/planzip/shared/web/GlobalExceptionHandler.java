package com.planzip.shared.web;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiError> notFound(HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND",
                "요청한 경로를 찾을 수 없습니다.", List.of(), request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiError> methodNotAllowed(HttpServletRequest request) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED",
                "지원하지 않는 요청 방식입니다.", List.of(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        List<ApiError.FieldViolation> violations = exception.getBindingResult()
                .getFieldErrors().stream()
                .map(field -> new ApiError.FieldViolation(field.getField(), field.getDefaultMessage()))
                .toList();
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                "입력값을 확인해 주세요.", violations, request);
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiError> databaseUnavailable(
            DataAccessException exception,
            HttpServletRequest request
    ) {
        log.error("Database request failed. traceId={}", request.getAttribute(TraceIdFilter.ATTRIBUTE), exception);
        return error(HttpStatus.SERVICE_UNAVAILABLE, "DATABASE_UNAVAILABLE",
                "데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", List.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Request failed. traceId={}", request.getAttribute(TraceIdFilter.ATTRIBUTE), exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR",
                "요청을 처리하지 못했습니다.", List.of(), request);
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String code,
            String message,
            List<ApiError.FieldViolation> fieldErrors,
            HttpServletRequest request
    ) {
        String traceId = (String) request.getAttribute(TraceIdFilter.ATTRIBUTE);
        return ResponseEntity.status(status)
                .body(new ApiError(code, message, fieldErrors, traceId));
    }
}
