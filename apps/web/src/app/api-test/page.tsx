'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    setResults({
      'NEXT_PUBLIC_API_URL':    apiUrl    || '❌ NOT SET',
      'NEXT_PUBLIC_SOCKET_URL': socketUrl || '❌ NOT SET',
      'Window location':        window.location.origin,
      'Testing backend...':     'please wait',
    });

    const backendUrl = apiUrl
      ? apiUrl.replace('/api/v1', '')
      : 'https://synq-api-z6kj.onrender.com';

    fetch(`${backendUrl}/health`, { method: 'GET' })
      .then(r => r.json())
      .then(d => setResults(prev => ({
        ...prev,
        'Backend health': JSON.stringify(d),
        'Backend status': '✅ REACHABLE',
        'Testing backend...': 'done',
      })))
      .catch(e => setResults(prev => ({
        ...prev,
        'Backend status':  `❌ ERROR: ${e.message}`,
        'Testing backend...': 'done',
        'Tip': 'Check if Render service is awake — visit https://synq-api-z6kj.onrender.com/health first',
      })));
  }, []);

  return (
    <div style={{ background:'#0A1A0C', minHeight:'100vh', padding:'40px', color:'#E2EBE4', fontFamily:'monospace' }}>
      <h1 style={{ color:'#00c4b4', marginBottom:'8px', fontSize:'20px' }}>Synq — API Diagnostic</h1>
      <p style={{ color:'#5A7A5E', marginBottom:'24px', fontSize:'13px' }}>
        This page shows what env variables Vercel built with
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {Object.entries(results).map(([key, val]) => (
          <div key={key} style={{
            background:'rgba(1,121,111,0.08)',
            border:'1px solid rgba(1,121,111,0.2)',
            borderRadius:'10px',
            padding:'14px 18px',
          }}>
            <div style={{ color:'#5A7A5E', fontSize:'11px', marginBottom:'4px', textTransform:'uppercase' }}>{key}</div>
            <div style={{ color: val.includes('❌') ? '#ef4444' : val.includes('✅') ? '#00c4b4' : '#E2EBE4', fontSize:'14px', wordBreak:'break-all' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
