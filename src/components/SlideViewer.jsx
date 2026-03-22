import { useRef } from 'react'
import { useSlides } from '../hooks/useSlides.js'

export default function SlideViewer() {
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const { currentPage, totalPages, nextSlide, prevSlide, loadPdf, isLoaded } = useSlides(canvasRef)

  return (
    <div className="flex flex-col items-center gap-6">
      {!isLoaded ? (
        <div className="flex flex-col items-center py-16">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6"
            style={{ background: '#12121A', border: '1px solid rgba(6,182,212,0.3)' }}
          >
            ⬜
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
            Load a PDF
          </h2>
          <p className="mb-6" style={{ color: '#94A3B8' }}>
            Navigate slides hands-free with head gestures.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}
          >
            Open PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) loadPdf(f)
            }}
          />
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="rounded-xl"
            style={{ maxWidth: '100%', border: '1px solid rgba(255,255,255,0.08)', background: '#000' }}
          />
          <div className="flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="px-5 py-2.5 rounded-xl font-semibold"
              style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >
              ← Prev
            </button>
            <span className="text-sm" style={{ color: '#64748B' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextSlide}
              className="px-5 py-2.5 rounded-xl font-semibold"
              style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
