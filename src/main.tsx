import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SpeedInsights } from '@vercel/speed-insights/react'

// 🟣 Apply theme from localStorage before rendering the app
const savedAppearance = localStorage.getItem('diary_appearance');
if (savedAppearance) {
  try {
    const { theme } = JSON.parse(savedAppearance);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Error parsing saved appearance theme:', e);
  }
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SpeedInsights />
  </>
)
