type FeatureLoader = () => void

let loaded = false
let loader: FeatureLoader | null = null

export function setFeatureLoader(load: FeatureLoader): void {
  loader = load
}

export function ensureGameFeaturesLoaded(): void {
  if (loaded || !loader) {
    return
  }
  loaded = true
  loader()
}

export function resetFeatureBoot(): void {
  loaded = false
}
