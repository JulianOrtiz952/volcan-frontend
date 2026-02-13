import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import { TimerProvider } from './context/TimerContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
)
