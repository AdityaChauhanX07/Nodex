import { useState, useRef } from 'react'

/**
 * useSlides — manages PDF.js slide state.
 * Renders current page onto the provided canvas ref.
 */
export function useSlides(canvasRef) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const pdfDocRef = useRef(null)
  const renderTaskRef = useRef(null)

  const renderPage = async (pdf, pageNum) => {
    if (!canvasRef.current) return
    try {
      renderTaskRef.current?.cancel?.()
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      await task.promise
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[useSlides] render error:', err)
      }
    }
  }

  const loadPdf = async file => {
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      setCurrentPage(1)
      setIsLoaded(true)
      await renderPage(pdf, 1)
    } catch (err) {
      console.error('[useSlides] load error:', err)
    }
  }

  const goToPage = async pageNum => {
    if (!pdfDocRef.current) return
    const clamped = Math.max(1, Math.min(totalPages, pageNum))
    setCurrentPage(clamped)
    await renderPage(pdfDocRef.current, clamped)
  }

  const nextSlide = () => goToPage(currentPage + 1)
  const prevSlide = () => goToPage(currentPage - 1)

  return { isLoaded, currentPage, totalPages, loadPdf, nextSlide, prevSlide, goToPage }
}
