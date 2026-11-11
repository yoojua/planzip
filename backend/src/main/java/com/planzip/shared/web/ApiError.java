package com.planzip.shared.web;

import java.util.List;

public record ApiError(
        String code,
        String message,
        List<FieldViolation> fieldErrors,
        String traceId
) {
    public record FieldViolation(String field, String message) {
    }
}
