import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TranscriptPage from './pages/TranscriptPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TranscriptPage />
  </React.StrictMode>
); 