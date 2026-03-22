import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useFaceDetection — initializes MediaPipe FaceMesh and webcam,
 * returns the latest landmarks array.
 */
export function useFaceDetection({ enabled = true } = {}) {
  const [landmarks, setLandmarks] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const activeRef = useRef(false)

  const handleResults = useCallback(results => {
    if (!activeRef.current) return
    const lm = results?.multiFaceLandmarks?.[0]
    setLandmarks(lm ?? null)
  }, [])

  useEffect(() => {
    if (!enabled) return
    activeRef.current = true

    let cleanup = () => {}

    async function init() {
      try {
        const video = document.createElement('video')
        video.width = 640
        video.height = 480
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        videoRef.current = video

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        video.srcObject = stream
        await video.play()

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
        faceMesh.onResults(handleResults)
        faceMeshRef.current = faceMesh

        const camera = new Camera(video, {
          onFrame: async () => {
            if (activeRef.current) await faceMesh.send({ image: video })
          },
          width: 640,
          height: 480,
        })
        camera.start()
        cameraRef.current = camera
        setIsReady(true)

        cleanup = () => {
          activeRef.current = false
          camera.stop?.()
          stream.getTracks().forEach(t => t.stop())
        }
      } catch (err) {
        console.error('[useFaceDetection]', err)
        setError(err)
      }
    }

    init()
    return () => {
      activeRef.current = false
      cleanup()
    }
  }, [enabled, handleResults])

  return { landmarks, isReady, error, videoRef }
}
