import { createContext } from 'react'
import type { SwapCue } from '@game/adventure/swaps'
export const SwapCueContext = createContext<SwapCue | undefined>(undefined)
