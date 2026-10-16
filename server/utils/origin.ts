import { SRC } from '#shared/cms'

export interface Fetched {
  status: number
  location: string
  html: string
}

export const local = (s: string) => s.replaceAll(`${SRC}/`, '/').replaceAll('http://sn.sicnu.edu.cn/', '/')

/* 原站页面；跳转只记下去处，不跟随 */
export const getPage = defineCachedFunction(
  async (path: string): Promise<Fetched> => {
    const res = await fetch(SRC + path, { redirect: 'manual' })
    const location = res.headers.get('location')
    return { status: res.status, location: location ? local(location) : '', html: location ? '' : await res.text() }
  },
  { name: 'page', maxAge: 300, swr: true },
)

export const postForm = defineCachedFunction(
  async (path: string, form: Record<string, string>) => {
    const res = await fetch(SRC + path, { method: 'POST', body: new URLSearchParams(form) })
    return res.text()
  },
  { name: 'post', maxAge: 60, swr: true },
)

export const getText = defineCachedFunction(
  async (path: string) => (await fetch(SRC + path)).text(),
  { name: 'text', maxAge: 3600, swr: true },
)
