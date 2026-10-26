import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { App as NamedApp } from './App';

const RootApp = App || NamedApp;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
