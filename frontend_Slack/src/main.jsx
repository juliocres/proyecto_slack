
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import ErrorBoundary from './Components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)
