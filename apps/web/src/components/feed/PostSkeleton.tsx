export function PostSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background:'rgba(13,19,28,0.7)', border:'1px solid rgba(109,129,150,0.08)' }}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full skeleton shrink-0"/>
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-32 skeleton rounded"/>
          <div className="h-2.5 w-24 skeleton rounded"/>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full skeleton rounded"/>
        <div className="h-3 w-5/6 skeleton rounded"/>
        <div className="h-3 w-3/4 skeleton rounded"/>
      </div>
      <div className="flex gap-3 pt-3" style={{ borderTop:'1px solid rgba(109,129,150,0.07)' }}>
        <div className="h-7 w-16 skeleton rounded-xl"/>
        <div className="h-7 w-16 skeleton rounded-xl"/>
        <div className="h-7 w-16 skeleton rounded-xl"/>
      </div>
    </div>
  );
}

export function FeedSkeletons({ count=3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => <PostSkeleton key={i}/>)}
    </div>
  );
}
