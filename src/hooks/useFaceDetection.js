import { useState, useEffect, useRef } from 'react'
// @mediapipe packages are loaded via <script> tags in index.html and exposed
// as window globals — this avoids all ESM/CJS bundler interop issues.

/**
 * useFaceDetection
 *
 * Wires MediaPipe FaceMesh to a <video> DOM element provided via `videoRef`.
 * The caller must render <video ref={videoRef} /> in the DOM before this hook's
 * effect runs. React guarantees refs are populated during the commit phase,
 * which occurs before useEffect callbacks fire — so this ordering is safe.
 *
 * The MediaPipe Camera utility handles getUserMedia internally; no separate
 * stream setup is needed.
 *
 * Returns { landmarks, isLoading, isTracking, error }
 *   landmarks  — array of 468 {x,y,z} normalized points, or null
 *   isLoading  — true while WASM model files are being fetched / compiled
 *   isTracking — true when a face is actively detected
 *   error      — Error if webcam access was denied or model failed to load
 */
export function useFaceDetection({ videoRef, enabled = true } = {}) {
  const [landmarks,  setLandmarks]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [error,      setError]      = useState(null)

  const activeRef = useRef(false)
  const cameraRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const video = videoRef?.current
    if (!video) return

    activeRef.current = true

    async function init() {
      try {
        if (!activeRef.current) return

        // Prefer window globals set by the CDN <script> tags.
        // Fall back to dynamic import for environments where globals aren't set.
        let FaceMesh = window.FaceMesh
        let Camera   = window.Camera

        if (typeof FaceMesh !== 'function' || typeof Camera !== 'function') {
          const [fmMod, camMod] = await Promise.all([
            import('@mediapipe/face_mesh'),
            import('@mediapipe/camera_utils'),
          ])
          FaceMesh = fmMod.FaceMesh  ?? fmMod.default?.FaceMesh  ?? fmMod.default
          Camera   = camMod.Camera   ?? camMod.default?.Camera   ?? camMod.default
        }

        if (typeof FaceMesh !== 'function') throw new Error('FaceMesh constructor not found')
        if (typeof Camera   !== 'function') throw new Error('Camera constructor not found')

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })

        faceMesh.setOptions({
          maxNumFaces:            1,
          refineLandmarks:        true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        })

        faceMesh.onResults((results) => {
          if (!activeRef.current) return
          const lm = results?.multiFaceLandmarks?.[0] ?? null
          setLandmarks(lm)
          setIsTracking(lm !== null)
          setIsLoading(false)   // clear spinner on first result
        })

        // Camera utility drives the rAF loop and calls getUserMedia itself
        const mpCamera = new Camera(video, {
          onFrame: async () => {
            if (activeRef.current) {
              await faceMesh.send({ image: video })
            }
          },
          width:  640,
          height: 480,
        })

        mpCamera.start()
        cameraRef.current = mpCamera
      } catch (err) {
        if (!activeRef.current) return
        console.error('[useFaceDetection]', err)
        setError(err)
        setIsLoading(false)
      }
    }

    init()

    return () => {
      activeRef.current = false
      cameraRef.current?.stop?.()
      cameraRef.current = null
      setLandmarks(null)
      setIsTracking(false)
    }
  }, [enabled]) // videoRef is a stable ref object — safe to omit from deps

  return { landmarks, isLoading, isTracking, error }
}
