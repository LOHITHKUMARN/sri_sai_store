"use client"

import { useEffect, useState, useCallback } from "react"

const SPLASH_KEY = "srisai_splash_shown"
// Total animation duration before auto-exit (ms)
// logo(0.8s) + title(1.25s) + subtitle(1.65s) + hold(0.9s) = 2.55s -> round to 2600
const SPLASH_DURATION = 2600
// Exit animation duration (matches .splash-exit CSS: 0.55s)
const EXIT_DURATION = 550

export default function SplashScreen() {
  const [show, setShow] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const beginExit = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => {
      setShow(false)
      try { sessionStorage.setItem(SPLASH_KEY, "1") } catch {}
    }, EXIT_DURATION)
  }, [exiting])

  useEffect(() => {
    setMounted(true)

    // Respect reduced-motion: skip entirely
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    // Already shown this session?
    let alreadyShown = false
    try { alreadyShown = !!sessionStorage.getItem(SPLASH_KEY) } catch {}
    if (alreadyShown) return

    setShow(true)

    const timer = setTimeout(() => {
      beginExit()
    }, SPLASH_DURATION)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Skip on tap/click
  const handleSkip = useCallback(() => {
    beginExit()
  }, [beginExit])

  if (!mounted || !show) return null

  return (
    <div
      role="status"
      aria-label="Loading Sri Sai Home Appliances"
      aria-live="polite"
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white cursor-pointer select-none ${exiting ? "splash-exit" : ""}`}
    >
      {/* Centered brand block */}
      <div className="flex flex-col items-center gap-4 px-6 text-center">

        {/* Logo */}
        <div className="splash-logo-animate">
          <img
            src="/logo.png"
            alt="Sri Sai Logo"
            draggable={false}
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
          />
        </div>

        {/* Brand Name */}
        <h1 className="splash-title-animate font-bold tracking-tight text-gray-900 text-3xl sm:text-4xl leading-tight">
          Sri Sai
        </h1>

        {/* Gold accent divider */}
        <div
          className="splash-line-animate h-[2px] bg-amber-500 rounded-full mx-auto"
          style={{ width: "4rem" }}
        />

        {/* Subtitle */}
        <p className="splash-subtitle-animate text-sm sm:text-base text-gray-500 font-medium tracking-wide uppercase">
          Home Appliances and Furnitures
        </p>
      </div>

      {/* Skip hint */}
      <p
        className="absolute bottom-8 text-xs text-gray-300 tracking-widest uppercase"
        style={{ animation: "splash-text-in 0.4s ease-out 1.8s both" }}
      >
        Tap to skip
      </p>
    </div>
  )
}
