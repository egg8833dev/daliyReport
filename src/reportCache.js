const cache = new Map() // date -> content

export function _clearCache() { cache.clear() }

export async function loadAllReports(manifest, onProgress) {
  const results = []
  let done = 0
  const total = manifest.length

  await Promise.all(manifest.map(async (m) => {
    let content = cache.get(m.date)
    if (content == null) {
      try {
        const res = await fetch(`/reports/${m.date}.json`)
        const data = await res.json()
        content = data.content
        cache.set(m.date, content)
      } catch {
        done += 1
        onProgress?.(done, total)
        return
      }
    }
    results.push({ date: m.date, generatedAt: m.generatedAt, content })
    done += 1
    onProgress?.(done, total)
  }))

  return results
}
