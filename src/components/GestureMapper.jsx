import { useState } from 'react'
import { GESTURES } from '../constants/gestures.js'
import { COMMANDS } from '../constants/commands.js'
import { DEFAULT_GESTURE_MAP } from '../constants/defaults.js'

export default function GestureMapper({ mapping: externalMapping, onChange }) {
  const [mapping, setMapping] = useState(externalMapping ?? DEFAULT_GESTURE_MAP)

  const handleChange = (gesture, command) => {
    const next = { ...mapping, [gesture]: command }
    setMapping(next)
    onChange?.(next)
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
        Gesture Mapping
      </h3>
      <div className="space-y-3">
        {Object.entries(mapping).map(([gesture, command]) => (
          <div key={gesture} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium" style={{ color: '#A78BFA', minWidth: 120 }}>
              {gesture}
            </span>
            <select
              value={command}
              onChange={e => handleChange(gesture, e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{
                background: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#F8FAFC',
              }}
            >
              {Object.values(COMMANDS).map(cmd => (
                <option key={cmd} value={cmd}>
                  {cmd}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
