'use client';

import { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSend:        (content: string) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop:  () => void;
  disabled?:     boolean;
}

export function ChatInput({ onSend, onTypingStart, onTypingStop, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setContent('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [content, sending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTypingStart();
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px`; }
  };

  const canSend = content.trim() && !sending && !disabled;

  return (
    <div className="flex items-end gap-3 p-4"
      style={{ borderTop:'1px solid rgba(109,129,150,0.08)', background:'rgba(8,12,18,0.95)' }}>
      <div className="flex-1 flex items-end rounded-2xl px-4 py-3 transition-all"
        style={{ background:'rgba(18,26,38,0.9)', border:'1px solid rgba(109,129,150,0.12)' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onTypingStop}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          disabled={disabled || sending}
          maxLength={2000}
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed max-h-[120px] overflow-y-auto"
          style={{ color:'#DCE4EC' }}
        />
      </div>

      <button onClick={handleSend} disabled={!canSend}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0"
        style={canSend
          ? { background:'linear-gradient(135deg,#01796F,#015a53)', color:'white', boxShadow:'0 2px 12px rgba(1,121,111,0.3)' }
          : { background:'rgba(18,26,38,0.6)', color:'#50606E', cursor:'not-allowed' }}>
        {sending
          ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 3 2 5 5-13z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        }
      </button>
    </div>
  );
}
