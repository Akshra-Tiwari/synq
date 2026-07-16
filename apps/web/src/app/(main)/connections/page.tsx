'use client';

import { useEffect, useState } from 'react';
import { useAuthStore }          from '../../../lib/store/auth.store';
import { ConnectionCard }        from '../../../components/connections/ConnectionCard';
import { Spinner, EmptyState }   from '../../../components/shared/UI';
import { cn }                    from '../../../lib/utils/cn';
import {
  getMyConnections,
  getPendingReceived,
  getPendingSent,
  acceptRequest,
  rejectRequest,
  removeConnection,
  withdrawRequest,
} from '../../../lib/api/connections.api';
import type { ConnectionPeer }   from '../../../lib/api/connections.api';
import { Avatar }                from '../../../components/shared/Avatar';
import { timeAgo }               from '../../../lib/utils/format';

type Tab = 'connections' | 'received' | 'sent';

export default function ConnectionsPage() {
  const { user }  = useAuthStore();
  const [tab, setTab]               = useState<Tab>('connections');
  const [connections, setConnections] = useState<ConnectionPeer[]>([]);
  const [received,    setReceived]    = useState<ConnectionPeer[]>([]);
  const [sent,        setSent]        = useState<ConnectionPeer[]>([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [connRes, recRes, sentRes] = await Promise.all([
        getMyConnections(),
        getPendingReceived(),
        getPendingSent(),
      ]);
      setConnections(connRes.data.connections);
      setTotal(connRes.data.total);
      setReceived(recRes.data.requests);
      setSent(sentRes.data.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAccept = async (userId: string) => {
    await acceptRequest(userId);
    await loadAll();
  };

  const handleReject = async (userId: string) => {
    await rejectRequest(userId);
    setReceived((prev) => prev.filter((r) => r.user._id !== userId));
  };

  const handleRemove = async (userId: string) => {
    await removeConnection(userId);
    setConnections((prev) => prev.filter((c) => c.user._id !== userId));
    setTotal((t) => Math.max(0, t - 1));
  };

  const handleWithdraw = async (userId: string) => {
    await withdrawRequest(userId);
    setSent((prev) => prev.filter((r) => r.user._id !== userId));
  };

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'connections', label: 'Connections', count: total },
    { id: 'received',    label: 'Requests',    count: received.length },
    { id: 'sent',        label: 'Sent',        count: sent.length },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Connections</h1>
        <p className="text-sm text-slate-500 mt-1">Your professional network on Synq.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              tab === id ? 'bg-white/[0.08] text-slate-200' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                tab === id
                  ? id === 'received'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-white/[0.08] text-slate-400'
                  : 'bg-white/[0.05] text-slate-600',
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* ── My connections ── */}
          {tab === 'connections' && (
            connections.length === 0 ? (
              <EmptyState
                title="No connections yet"
                description="Connect with developers to grow your network."
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {connections.map(({ connectionId, user: peer, connectedAt }) => (
                  <div key={connectionId} className="relative group">
                    <ConnectionCard
                      user={peer}
                      currentUserId={user?._id}
                      showActions={false}
                    />
                    {/* Connected since + remove */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {connectedAt && (
                        <span className="text-xs text-slate-600">{timeAgo(connectedAt)}</span>
                      )}
                      <button
                        onClick={() => peer._id && handleRemove(peer._id)}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Pending received ── */}
          {tab === 'received' && (
            received.length === 0 ? (
              <EmptyState title="No pending requests" description="You're all caught up." />
            ) : (
              <div className="space-y-3">
                {received.map(({ connectionId, user: peer, requestedAt }) => (
                  <div key={connectionId}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/[0.10] transition-all">
                    <Avatar src={peer.avatar} name={peer.name ?? ''} size="md" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{peer.name}</p>
                      <p className="text-xs text-slate-500">@{peer.username}</p>
                      {peer.skills && peer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {peer.skills.slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                      {requestedAt && (
                        <p className="text-xs text-slate-700 mt-1">{timeAgo(requestedAt)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => peer._id && handleAccept(peer._id)}
                        className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => peer._id && handleReject(peer._id)}
                        className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 text-sm transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Sent requests ── */}
          {tab === 'sent' && (
            sent.length === 0 ? (
              <EmptyState title="No sent requests" description="You haven't sent any connection requests." />
            ) : (
              <div className="space-y-3">
                {sent.map(({ connectionId, user: peer, requestedAt }) => (
                  <div key={connectionId}
                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/[0.10] transition-all">
                    <Avatar src={peer.avatar} name={peer.name ?? ''} size="md" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{peer.name}</p>
                      <p className="text-xs text-slate-500">@{peer.username}</p>
                      {requestedAt && (
                        <p className="text-xs text-slate-700 mt-1">Sent {timeAgo(requestedAt)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => peer._id && handleWithdraw(peer._id)}
                      className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-red-400 hover:border-red-500/20 text-sm transition-all"
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
