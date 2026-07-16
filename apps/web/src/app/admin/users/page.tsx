'use client';

import { useEffect, useState, useCallback } from 'react';
import { listUsers, setUserRole, verifyUser, deleteUser } from '../../../lib/api/admin.api';
import { Avatar }  from '../../../components/shared/Avatar';
import { Spinner } from '../../../components/shared/UI';
import { timeAgo } from '../../../lib/utils/format';
import { cn }      from '../../../lib/utils/cn';
import type { AdminUser } from '../../../lib/api/admin.api';

type Filter = 'all' | 'verified' | 'unverified' | 'admins';

export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [inputVal,   setInputVal]   = useState('');
  const [filter,     setFilter]     = useState<Filter>('all');
  const [acting,     setActing]     = useState<string | null>(null);

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'verified',   label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
    { value: 'admins',     label: 'Admins' },
  ];

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await listUsers({ q: query || undefined, page: p, filter });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } finally { setLoading(false); }
  }, [query, filter]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputVal.trim());
  };

  const handleRoleToggle = async (user: AdminUser) => {
    setActing(user._id);
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const res = await setUserRole(user._id, newRole);
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: res.data.user.role } : u));
    } finally { setActing(null); }
  };

  const handleVerify = async (userId: string) => {
    setActing(userId);
    try {
      await verifyUser(userId);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isVerified: true } : u));
    } finally { setActing(null); }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}'s account? This is permanent.`)) return;
    setActing(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setTotal((t) => t - 1);
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Users</h1>
        <p className="text-sm text-slate-500 mt-1">{total} total developers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={inputVal} onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search by name, username or email…"
              className="w-full h-10 bg-white/[0.04] border border-white/[0.07] rounded-xl pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"/>
          </div>
        </form>
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl">
          {FILTERS.map(({ value, label }) => (
            <button key={value} onClick={() => setFilter(value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === value ? 'bg-white/[0.08] text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Stats', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name} size="sm"/>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-600">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        u.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                          : 'bg-white/[0.04] text-slate-500 border-white/[0.08]')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border',
                        u.isVerified
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                          : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{timeAgo(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div>{u.stats.postsCount} posts</div>
                        <div>{u.stats.connectionsCount} connections</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {!u.isVerified && (
                          <button onClick={() => handleVerify(u._id)} disabled={acting === u._id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                            Verify
                          </button>
                        )}
                        <button onClick={() => handleRoleToggle(u)} disabled={acting === u._id}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] hover:bg-amber-500/20 transition-all disabled:opacity-50">
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)} disabled={acting === u._id}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] hover:bg-red-500/20 transition-all disabled:opacity-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
              <p className="text-xs text-slate-600">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => load(page - 1)}
                  className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-all">← Prev</button>
                <button disabled={page >= totalPages} onClick={() => load(page + 1)}
                  className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-all">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
