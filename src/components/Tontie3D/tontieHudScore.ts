import { useEffect } from 'react'

const HIGH_SCORE_KEY = 'tontie.highScore'

export function readHighScore(): number {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0
  } catch {
    return 0
  }
}

export function useHighScore(score: number): number {
  useEffect(() => {
    if (score <= readHighScore()) return
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(score))
    } catch {
      // private mode: no stored record, the current score is shown instead
    }
  }, [score])
  return Math.max(readHighScore(), score)
}
