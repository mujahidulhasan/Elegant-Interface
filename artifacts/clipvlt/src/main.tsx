import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary for debugging
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#ef4444' }}>App Error</h1>
      <pre style={{ 
        background: '#1a1a1a', 
        padding: 20, 
        borderRadius: 12,
        overflow: 'auto',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {error?.message || 'Unknown error'}
        {'\n\n'}
        {error?.stack || 'No stack trace'}
      </pre>
    </div>
  );
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('No #root element found');
  
  createRoot(rootElement).render(<App />);
} catch (err) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="padding:40px;font-family:sans-serif;background:#000;color:#fff;min-height:100vh">
        <h1 style="color:#ef4444">Failed to start app</h1>
        <pre style="background:#1a1a1a;padding:20px;border-radius:12px;overflow:auto;font-size:14px">${(err as Error)?.message || String(err)}</pre>
      </div>`;
    rootElement.appendChild(errorDiv);
  }
}
