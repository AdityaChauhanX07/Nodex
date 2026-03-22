import { useEffect, useRef, forwardRef } from 'react'

const Camera = forwardRef(function Camera({ onStream, className = '' }, ref) {
  const videoRef = useRef(null)

  // Expose the video element via ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') ref(videoRef.current)
      else ref.current = videoRef.current
    }
  }, [ref])

  useEffect(() => {
    let stream = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        onStream?.(stream)
      } catch (err) {
        console.error('[Camera] getUserMedia error:', err)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [onStream])

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      playsInline
      muted
      style={{ transform: 'scaleX(-1)' }}
    />
  )
})

export default Camera
