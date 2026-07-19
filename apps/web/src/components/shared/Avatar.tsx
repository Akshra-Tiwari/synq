import Image from 'next/image';
import { cn } from '../../lib/utils/cn';

interface AvatarProps {
  src?:      string;
  name:      string;
  size?:     'xs'|'sm'|'md'|'lg'|'xl'|'2xl';
  online?:   boolean;
  className?: string;
  style?:    React.CSSProperties;
}

const SIZES = { xs:24, sm:32, md:40, lg:52, xl:72, '2xl':96 };
const TEXT  = { xs:'text-[9px]', sm:'text-xs', md:'text-sm', lg:'text-base', xl:'text-xl', '2xl':'text-2xl' };

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

function avatarColor(name: string) {
  const colors = ['#01796F','#015a53','#1a5c45','#2d6a4f','#6D8196','#4a6b7a'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size='md', online, className, style }: AvatarProps) {
  const px = SIZES[size];
  return (
    <div className={cn('relative shrink-0', className)} style={style}>
      <div className="rounded-full overflow-hidden"
        style={{ width:px, height:px, background:avatarColor(name) }}>
        {src
          ? <Image src={src} alt={name} width={px} height={px} className="object-cover w-full h-full"/>
          : <div className={cn('w-full h-full flex items-center justify-center font-semibold text-white', TEXT[size])}>
              {initials(name)}
            </div>
        }
      </div>
      {online !== undefined && (
        <span className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width:       size==='xs'?8:size==='sm'?9:11,
            height:      size==='xs'?8:size==='sm'?9:11,
            background:  online?'#01796F':'#3A5A3E',
            borderColor: '#0E1A13',
            boxShadow:   online?'0 0 6px rgba(1,121,111,0.8)':'none',
          }}/>
      )}
    </div>
  );
}
