import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadAllReports, _clearCache } from './reportCache.js'

beforeEach(() => { _clearCache() })

function mockFetchOk(map) {
  return vi.fn(async (url) => {
    const date = url.match(/(\d{4}-\d{2}-\d{2})\.json$/)[1]
    if (map[date] == null) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: true, status: 200, json: async () => ({ date, content: map[date] }) }
  })
}

describe('loadAllReports', () => {
  it('loads all reports and reports progress', async () => {
    global.fetch = mockFetchOk({ '2026-07-05': 'A', '2026-07-06': 'B' })
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }, { date: '2026-07-05', generatedAt: 'x' }]
    const progress = []
    const out = await loadAllReports(manifest, (d, t) => progress.push([d, t]))
    expect(out.map(r => r.content).sort()).toEqual(['A', 'B'])
    expect(progress.at(-1)).toEqual([2, 2])
  })

  it('skips failed fetches without throwing', async () => {
    global.fetch = mockFetchOk({ '2026-07-06': 'B' }) // 07-05 will 404
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }, { date: '2026-07-05', generatedAt: 'x' }]
    const out = await loadAllReports(manifest)
    expect(out.map(r => r.content)).toEqual(['B'])
  })

  it('skips a 200 response with no content field', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ date: '2026-07-06' }) }))
    const out = await loadAllReports([{ date: '2026-07-06', generatedAt: 'y' }])
    expect(out).toEqual([])
  })

  it('caches content so a second call does not re-fetch', async () => {
    const fetchMock = mockFetchOk({ '2026-07-06': 'B' })
    global.fetch = fetchMock
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }]
    await loadAllReports(manifest)
    await loadAllReports(manifest)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
