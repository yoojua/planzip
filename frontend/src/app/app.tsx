import { BrowserRouter } from 'react-router'
import { AppRouter } from './router'

export function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
