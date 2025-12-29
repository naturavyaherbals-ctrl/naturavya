"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"

type LeafItem = {
  id: number
  x: string
  size: number
  duration: number
  delay: number
  rotate: number
}

export default function FloatingLeaves() {
  const [leaves, setLeaves] = useState<LeafItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const generated: LeafItem[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}vw`,
      size: 20 + Math.random() * 30,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 6,
      rotate: Math.random() * 360,
    }))

    setLeaves(generated)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-primary/20"
          style={{
            left: leaf.x,
            fontSize: leaf.size,
          }}
          initial={{
            y: -120,
            rotate: leaf.rotate,
          }}
          animate={{
            y: "110vh",
            rotate: leaf.rotate + 360,
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Leaf />
        </motion.div>
      ))}
    </div>
  )
}
