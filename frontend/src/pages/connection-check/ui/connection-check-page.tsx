import { useState } from "react";
import { ApiError } from "@/shared/api";
import { checkErrorResponse, checkHealth } from "../api/connection-check";
import type { HealthResponse } from "../api/connection-check";

type CheckState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; health: HealthResponse }
  | { type: "error"; error: ApiError };

export function ConnectionCheckPage() {
  const [state, setState] = useState<CheckState>({ type: "idle" });
  const isLoading = state.type === "loading";

  async function runCheck(check: "health" | "error") {
    setState({ type: "loading" });

    try {
      if (check === "health") {
        const health = await checkHealth();
        setState({ type: "success", health });
      } else {
        await checkErrorResponse();
        throw new ApiError(200, {
          code: "UNEXPECTED_SUCCESS",
          message: "오류 확인 경로에서 성공 응답이 반환되었습니다.",
          fieldErrors: [],
        });
      }
    } catch (error) {
      setState({
        type: "error",
        error:
          error instanceof ApiError
            ? error
            : new ApiError(0, {
                code: "UNKNOWN_ERROR",
                message: "요청 결과를 확인하지 못했습니다. 다시 시도해 주세요.",
                fieldErrors: [],
              }),
      });
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <span className="brand">plan.zip</span>
        <span className="chapter-label">Chapter 02</span>
      </header>

      <section className="check-card" aria-labelledby="page-title">
        <p className="eyebrow">LOCAL DEVELOPMENT</p>
        <h1 id="page-title">첫 연결을 확인해요.</h1>
        <p className="description">
          React 화면에서 Spring Boot API를 호출하고,
          <br />
          정상 응답과 오류 응답을 확인하는 개발용 화면입니다.
        </p>

        <div className="actions">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void runCheck("health")}
          >
            서버 연결 확인
          </button>
          <button
            type="button"
            className="button-secondary"
            disabled={isLoading}
            onClick={() => void runCheck("error")}
          >
            오류 응답 확인
          </button>
        </div>

        <div className="result-panel" aria-busy={isLoading}>
          {state.type === "idle" && (
            <p className="muted">
              버튼을 누르면 요청 결과가 여기에 표시됩니다.
            </p>
          )}
          {state.type === "loading" && (
            <p role="status">서버 응답을 기다리고 있어요.</p>
          )}
          {state.type === "success" && (
            <div role="status">
              <p className="result-heading success">서버에 연결되었습니다.</p>
              <dl className="response-list">
                <dt>서비스</dt>
                <dd>{state.health.service}</dd>
                <dt>서버 상태</dt>
                <dd>{state.health.status}</dd>
                <dt>데이터베이스</dt>
                <dd>{state.health.database}</dd>
                <dt>메시지</dt>
                <dd>{state.health.message}</dd>
              </dl>
            </div>
          )}
          {state.type === "error" && (
            <div role="alert">
              <p className="result-heading error">오류 응답을 확인했습니다.</p>
              <p>{state.error.message}</p>
              <dl className="response-list">
                <dt>오류 코드</dt>
                <dd>{state.error.code}</dd>
                <dt>HTTP 상태</dt>
                <dd>{state.error.status || "연결 실패"}</dd>
                {state.error.traceId && (
                  <>
                    <dt>요청 추적 ID</dt>
                    <dd className="trace-id">{state.error.traceId}</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>

        <p className="endpoint-note">
          정상 요청 <code>GET /api/health</code>
          <br />
          오류 요청 <code>GET /api/not-found</code>
        </p>
      </section>

      <footer className="page-footer">
        계획을 기록하는 서비스, 작은 연결부터 시작합니다.
      </footer>
    </main>
  );
}
