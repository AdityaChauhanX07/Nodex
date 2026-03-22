import { useEffect, useRef } from 'react'
import {
  FACE_OUTLINE_INDICES,
  RIGHT_EYEBROW_INDICES,
  LEFT_EYEBROW_INDICES,
  RIGHT_EYE_LOOP,
  LEFT_EYE_LOOP,
  KEY_DOT_INDICES,
} from '../utils/landmarks.js'

/**
 * GestureHUD — <canvas> overlay drawn every rAF frame on top of the Camera
 * PiP. Must be a child of Camera so it inherits the 240x180 container.
 *
 * Props:
 *   landmarks — array of 468 {x,y,z} normalized points, or null
 */
export default function GestureHUD({ landmarks }) {
  const canvasRef    = useRef(null)
  const landmarksRef = useRef(landmarks)
  const rafRef       = useRef(null)

  // Keep ref in sync every render without re-running the draw effect
  landmarksRef.current = landmarks

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      const lm = landmarksRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (lm && lm.length > 0) {
        const W = canvas.width
        const H = canvas.height

        // Mirror x to match CSS scaleX(-1) on the video element
        const px = (idx) => (1 - lm[idx].x) * W
        const py = (idx) => lm[idx].y * H

        // Draw a polyline through an array of landmark indices
        const polyline = (indices, close = false) => {
          if (!indices.length) return
          ctx.beginPath()
          indices.forEach((idx, i) => {
            if (idx >= lm.length) return
            i === 0 ? ctx.moveTo(px(idx), py(idx)) : ctx.lineTo(px(idx), py(idx))
          })
          if (close) ctx.closePath()
        }

        // Face silhouette
        ctx.save()
        ctx.strokeStyle = 'rgba(124,58,237,0.35)'
        ctx.lineWidth   = 0.7
        polyline(FACE_OUTLINE_INDICES)
        ctx.stroke()
        ctx.restore()

        // Eyebrows
        ctx.save()
        ctx.strokeStyle = 'rgba(167,139,250,0.55)'
        ctx.lineWidth   = 1
        for (const brow of [RIGHT_EYEBROW_INDICES, LEFT_EYEBROW_INDICES]) {
          polyline(brow)
          ctx.stroke()
        }
        ctx.restore()

        // Eye outlines
        ctx.save()
        ctx.strokeStyle = 'rgba(6,182,212,0.6)'
        ctx.lineWidth   = 0.8
        for (const eye of [RIGHT_EYE_LOOP, LEFT_EYE_LOOP]) {
          polyline(eye, true)
          ctx.stroke()
        }
        ctx.restore()

        // Key landmark dots
        ctx.save()
        KEY_DOT_INDICES.forEach((idx, i) => {
          if (idx >= lm.length) return
          ctx.fillStyle = i % 3 === 0 ? '#06B6D4' : '#A78BFA'
          ctx.beginPath()
          ctx.arc(px(idx), py(idx), 1.5, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // intentionally empty — uses landmarksRef to get fresh data each frame

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={180}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
