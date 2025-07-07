import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeFlow } from './config/flow'

// Initialize Flow configuration
initializeFlow();

createRoot(document.getElementById("root")!).render(<App />);
