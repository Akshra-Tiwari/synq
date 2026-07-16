'use client';

import Link from 'next/link';
import { Avatar }           from '../shared/Avatar';
import { AvailabilityBadge } from '../shared/Badges';
import { ConnectionButton } from './ConnectionButton';
import { compactNumber }    from '../../lib/utils/format';

interface ConnectionCardProps {
  user:           Partial<{ _id:string; name:string; username:string; avatar?:string; bio?:string; skills?:string[]; location?:string; openToWork?:boolean; availability?:string; stats?:{connectionsCount:number} }>;
  currentUserId?: string;
  mutualCount?:   number;
  showActions?:   boolean;
  variant?:       'default' | 'compact';
  className?:     string;
}

export function ConnectionCard({
  user, currentUserId, mutualCount, showActions=true, variant='default', className,
}: ConnectionCardProps) {
  const isOwn = currentUserId === user._id;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${className ?? ''}`}
        style={{ background:'rgba(13,19,28,0.6)', border:'1px solid rgba(109,129,150,0.1)' }}>
        <Link href={`/${user.username}`}>
          <Avatar src={user.avatar} name={user.name ?? ''} size="sm"/>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/${user.username}`}>
            <p className="text-sm font-medium truncate" style={{ color:'#DCE4EC' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color:'#50606E' }}>@{user.username}</p>
          </Link>
        </div>
        {showActions && !isOwn && user._id && (
          <ConnectionButton targetUserId={user._id} targetUsername={user.username ?? ''} compact/>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 card card-hover ${className ?? ''}`}>
      <div className="flex items-start justify-between mb-3">
        <Link href={`/${user.username}`} className="flex items-center gap-3">
          <Avatar src={user.avatar} name={user.name ?? ''} size="md"/>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color:'#DCE4EC' }}>{user.name}</p>
            <p className="text-xs" style={{ color:'#50606E' }}>@{user.username}</p>
          </div>
        </Link>
      </div>

      {user.bio && (
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color:'#50606E' }}>{user.bio}</p>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {user.skills.slice(0,4).map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background:'rgba(1,121,111,0.1)', border:'1px solid rgba(1,121,111,0.2)', color:'#00c4b4' }}>
              {s}
            </span>
          ))}
          {user.skills.length > 4 && (
            <span className="px-2 py-0.5 text-[10px]" style={{ color:'#50606E' }}>+{user.skills.length-4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 text-xs" style={{ color:'#50606E' }}>
        {user.location && <span>📍 {user.location}</span>}
        {user.stats && <span>{compactNumber(user.stats.connectionsCount)} connections</span>}
        {mutualCount !== undefined && mutualCount > 0 && (
          <span style={{ color:'#01796F' }}>{mutualCount} mutual</span>
        )}
      </div>

      {user.availability && user.availability !== 'not-available' && (
        <div className="mb-3"><AvailabilityBadge availability={user.availability}/></div>
      )}

      {showActions && !isOwn && user._id && (
        <ConnectionButton targetUserId={user._id} targetUsername={user.username ?? ''} className="w-full"/>
      )}
    </div>
  );
}
