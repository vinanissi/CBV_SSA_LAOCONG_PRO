import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { initThemeRuntime } from '@/runtime/themeRuntime';
import { isRenderPerfEnabled, markRenderEnd, markRenderStart } from '@/shared/utils/renderPerf';
import './styles/index.css';
import './styles/operator-design-baseline-v1.css';
import './styles/theme-dark.css';

initThemeRuntime();

if (isRenderPerfEnabled()) {
  markRenderStart('app-shell-mount');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

if (isRenderPerfEnabled()) {
  requestAnimationFrame(() => {
    markRenderEnd('app-shell-mount');
  });
}
