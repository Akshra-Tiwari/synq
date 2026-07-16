'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConnectionsStore } from '../lib/store/connections.store';
import * as connectionsApi     from '../lib/api/connections.api';
import { getApiErrorMessage }  from '../lib/utils/errors';

/**
 * Manages the connection relationship between the current user and `targetUserId`.
 * Fetches status on mount (cached), exposes all actions.
 */
export function useConnection(targetUserId: string | undefined) {
  const { setStatus, getStatus, invalidate } = useConnectionsStore();
  const cached = targetUserId ? getStatus(targetUserId) : undefined;

  const [loading,  setLoading]  = useState(!cached && !!targetUserId);
  const [actioning, setActioning] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Fetch status if not cached
  useEffect(() => {
    if (!targetUserId || cached) return;
    setLoading(true);
    connectionsApi.getStatus(targetUserId)
      .then((res) => setStatus(targetUserId, res.data))
      .catch(() => setStatus(targetUserId, { status: 'none', connectionId: null }))
      .finally(() => setLoading(false));
  }, [targetUserId, cached, setStatus]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setActioning(true);
    setError(null);
    try {
      await action();
      if (targetUserId) invalidate(targetUserId);
      // Re-fetch fresh status
      const res = await connectionsApi.getStatus(targetUserId!);
      setStatus(targetUserId!, res.data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setActioning(false);
    }
  }, [targetUserId, invalidate, setStatus]);

  const send     = () => run(() => connectionsApi.sendRequest(targetUserId!).then(() => {}));
  const accept   = () => run(() => connectionsApi.acceptRequest(targetUserId!).then(() => {}));
  const reject   = () => run(() => connectionsApi.rejectRequest(targetUserId!).then(() => {}));
  const remove   = () => run(() => connectionsApi.removeConnection(targetUserId!).then(() => {}));
  const withdraw = () => run(() => connectionsApi.withdrawRequest(targetUserId!).then(() => {}));

  return {
    status:     cached?.status ?? 'none',
    isSender:   cached?.isSender,
    loading,
    actioning,
    error,
    send,
    accept,
    reject,
    remove,
    withdraw,
  };
}

/**
 * Fetches and manages the pending requests inbox count.
 */
export function usePendingCount() {
  const { pendingCount, setPendingCount } = useConnectionsStore();

  useEffect(() => {
    connectionsApi.getPendingReceived()
      .then((res) => setPendingCount(res.data.requests.length))
      .catch(() => {});
  }, [setPendingCount]);

  return pendingCount;
}
