import { createContext } from 'react'
import type { AdventureState } from '@game/adventure/types'

/** Engine time drives all three parts of the eating rig in Adventure. */
export const AdventureSnackContext = createContext<AdventureState | null>(null)
