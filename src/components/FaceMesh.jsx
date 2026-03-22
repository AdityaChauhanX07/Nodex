import { useEffect, useRef } from 'react'

/**
 * FaceMesh component initializes MediaPipe FaceMesh and processes video frames.
 * Calls onLandmarks(results) each frame.
 */
export default function FaceMesh({ videoRef, onLandmarks, enabled = true }) {
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    if (!enabled || !videoRef?.current) return

    let active = true

    async function init() {
      try {
        const { FaceMesh } = await import('@mediapipe/face_mesh')
        const { Camera } = await import('@mediapipe/camera_utils')

        const faceMesh = new FaceMesh({
          locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        faceMesh.onResults(results => {
          if (active) onLandmarks?.(results)
        })

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (active && videoRef.current) {
              await faceMesh.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480,
        })

        camera.start()
        faceMeshRef.current = faceMesh
        cameraRef.current = camera
      } catch (err) {
        console.error('[FaceMesh] init error:', err)
      }
    }

    init()

    return () => {
      active = false
      cameraRef.current?.stop?.()
    }
  }, [enabled, videoRef, onLandmarks])

  return null
}
