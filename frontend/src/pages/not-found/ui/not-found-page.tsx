import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="check-card">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없어요.</h1>
        <p className="description">입력한 주소를 확인해 주세요.</p>
        <Link className="text-link" to="/">
          연결 확인 화면으로 돌아가기
        </Link>
      </section>
    </main>
  )
}
