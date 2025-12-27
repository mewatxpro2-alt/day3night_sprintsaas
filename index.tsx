import React from 'react'; // Force rebuild
import ReactDOM from 'react-dom/client';
import App from './App';

import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Toaster position="top-right" />
      <App />
    </HelmetProvider>
  </React.StrictMode>
);