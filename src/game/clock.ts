/** Injectable randomness for {@link tick} and {@link GameSession}. */
export type RandomSource = () => number

/** Wall-clock ms for presenters and UI animation sync. */
export type Clock = () => number
