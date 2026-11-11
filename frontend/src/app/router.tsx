import { Route, Routes } from 'react-router'
import { ConnectionCheckPage } from '@/pages/connection-check'
import { NotFoundPage } from '@/pages/not-found'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ConnectionCheckPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
