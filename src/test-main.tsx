import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple test to verify React is working
console.log('React app is loading...');

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(&lt;App /&gt;);

// Log any errors
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});