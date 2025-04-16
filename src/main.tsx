
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set light mode as default
document.documentElement.classList.remove('dark')

createRoot(document.getElementById("root")!).render(<App />);
