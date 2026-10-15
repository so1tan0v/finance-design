import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { bootChrome } from './components/WorkModules.jsx';
import './styles.css';

bootChrome();
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
