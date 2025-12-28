"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Bubble = {
  id: number
  left: string
  size: string
  duration: number
  delay: number
}

export default function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const generated: Bubble[] = Array.from({ length: 14 }).map((_, i) => {
      const size = 80 + Math.random() * 80

      return {
        id: i,
        left: `${Math.random() * 100}vw`,
        size: `${size}px`,
        duration: 22 + Math.random() * 10,
        delay: Math.random() * 6,
      }
    })

    setBubbles(generated)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-primary/10 blur-xl"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: 1 }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
