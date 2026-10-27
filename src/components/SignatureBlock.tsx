


export function SignatureBlock({ name, timestamp }: { name: string; timestamp: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
      <p className="text-sm font-semibold" style={{ color: '#34D399', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic' }}>{name}</p>
      <p className="text-xs font-mono mt-0.5" style={{ color: '#3A3F55' }}>{timestamp}</p>
    </div>
  );
}
