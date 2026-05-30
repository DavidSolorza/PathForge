import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  color: 'primary' | 'gold'
}

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: Particle[] = []
    const CONNECTION_DISTANCE = 150
    const PARTICLE_COUNT = 80

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        color: i % 3 === 0 ? 'gold' : 'primary',
      })
    }

    function draw() {
      if (!canvas || !ctx) return

      if (canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth
      }
      if (canvas.height !== window.innerHeight) {
        canvas.height = window.innerHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const primaryColor = '45, 106, 79'
      const goldColor = '201, 168, 106'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const colorRgb = p.color === 'gold' ? goldColor : primaryColor

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colorRgb}, ${p.alpha})`
        ctx.fill()

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        gradient.addColorStop(0, `rgba(${colorRgb}, ${p.alpha * 0.5})`)
        gradient.addColorStop(1, `rgba(${colorRgb}, 0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.15
            const lineColor = p.color === 'gold' || p2.color === 'gold' ? goldColor : primaryColor
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      const time = Date.now() * 0.0001
      const gradientBg = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(time) * 100,
        canvas.height * 0.5 + Math.cos(time) * 100,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      )
      gradientBg.addColorStop(0, 'rgba(45, 106, 79, 0.02)')
      gradientBg.addColorStop(0.5, 'rgba(201, 168, 106, 0.01)')
      gradientBg.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradientBg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
