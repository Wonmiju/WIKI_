import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './styles/global.css';

function renderFatalError(
  title: string,
  error: unknown,
): void {
  const root = document.getElementById('root');

  if (!root) {
    return;
  }

  const message =
    error instanceof Error
      ? `${error.message}\n\n${error.stack ?? ''}`
      : String(error);

  root.innerHTML = `
    <div style="
      min-height: 100vh;
      box-sizing: border-box;
      padding: 24px;
      background: #ffffff;
      color: #b00020;
      font-family: Consolas, monospace;
      white-space: pre-wrap;
    ">
      <h2>${title}</h2>
      <pre>${message}</pre>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  console.error('[window error]', event.error ?? event.message);

  renderFatalError(
    'JavaScript 실행 오류',
    event.error ?? event.message,
  );
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandled rejection]', event.reason);

  renderFatalError(
    '처리되지 않은 비동기 오류',
    event.reason,
  );
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('index.html에 #root 요소가 없습니다.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);