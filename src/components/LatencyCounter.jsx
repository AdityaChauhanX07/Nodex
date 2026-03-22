import { useGesture } from '../context/GestureContext.jsx'

export default function LatencyCounter() {
  const { latency } = useGesture()

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4B5563' }}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: latency == null ? '#4B5563' : latency < 50 ? '#22C55E' : latency < 100 ? '#F59E0B' : '#EF4444',
        }}
      />
      <span>{latency != null ? `${latency}ms` : '—'}</span>
    </div>
  )
}
