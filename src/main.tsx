import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Home } from './pages/home'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='antialiased bg-background text-foreground'>
      <Home />
    </div>
  </StrictMode>
)
