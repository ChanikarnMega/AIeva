import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { CandidatesProvider } from './state/CandidatesContext.jsx';
import './modernist.css';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <CandidatesProvider>
        <App />
      </CandidatesProvider>
    </HashRouter>
  </React.StrictMode>,
);
