'use client';

import { useState, useEffect } from 'react';

const RENDER_URL = 'https://synq-api-z6kj.onrender.com';

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, string>>({
    'Page loading': 'please wait...'
  });

  useEffect(() => {
    const isProduction = !window.location.hostname.includes('localhost');
    const apiUrl = isProduction
      ? `${RENDER_URL}/api/v1`
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1');

    setResults({
      'Is Production':          isProduction ? '✅ YES' : '🔧 NO (local)',
      'API URL being used':     apiUrl,
      'Window hostname':        window.location.hostname,
      'NEXT_PUBLIC_API_URL env': process.env.NEXT_PUBLIC_API_URL || '(not set)',
      'Waking up Render...':    'testing connection...',
    });

    // Test the actual URL being used
    fetch(`${RENDER_URL}/health`)
      .then(r => r.json())
      .then(d => setResults(prev => ({
        ...prev,
        'Render health':       JSON.stringify(d),
        'Backend status':      '✅ REACHABLE — login should work now',
        'Waking up Render...': 'done',
      })))
      .catch(e => setResults(prev => ({
        ...prev,
        'Backend status':      `❌ STILL DOWN: ${e.message}`,
        'Waking up Render...': 'done',
        'Action needed':       'Go to render.com → your service → click Resume/Deploy',
      })));
  }, []);

  return (
    <div style={{ background:'#0A1A0C', minHeight:'100vh', padding:'40px', color:'#E2EBE4', fontFamily:'monospace' }}>
      <h1 style={{ color:'#00c4b4', marginBottom:'8px', fontSize:'20px' }}>Synq — API Diagnostic</h1>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px' }}>
        {Object.entries(results).map(([key, val]) => (
          <div key={key} style={{
            background: val.includes('✅') ? 'rgba(1,121,111,0.12)' : val.includes('❌') ? 'rgba(239,68,68,0.08)' : 'rgba(1,121,111,0.06)',
            border: `1px solid ${val.includes('✅') ? 'rgba(1,121,111,0.3)' : val.includes('❌') ? 'rgba(239,68,68,0.25)' : 'rgba(1,121,111,0.15)'}`,
            borderRadius:'10px', padding:'14px 18px',
          }}>
            <div style={{ color:'#5A7A5E', fontSize:'11px', marginBottom:'4px', textTransform:'uppercase' }}>{key}</div>
            <div style={{ color: val.includes('❌') ? '#ef4444' : val.includes('✅') ? '#00c4b4' : '#E2EBE4', fontSize:'14px', wordBreak:'break-all' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
