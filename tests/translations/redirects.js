import { languageKeys } from '../../lib/languages.js'
import { get } from '../helpers/e2etest.js'
import { PREFERRED_LOCALE_COOKIE_NAME } from '../../lib/constants.js'

const langs = languageKeys.filter((lang) => lang !== 'en')

describe('redirects', () => {
  test.each(langs)('redirects to %s if accept-language', async (lang) => {
    const res = await get('/get-started', {
      headers: { 'accept-language': lang },
      followRedirects: false,
    })
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe(`/${lang}/get-started`)
    expect(res.headers['cache-control']).toBe('private, no-store')
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  test.each(langs)('redirects to %s if PREFERRED_LOCALE_COOKIE_NAME', async (lang) => {
    const res = await get('/get-started', {
      headers: {
        'accept-language': 'en',
        Cookie: `${PREFERRED_LOCALE_COOKIE_NAME}=${lang}`,
      },
      followRedirects: false,
    })
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe(`/${lang}/get-started`)
    expect(res.headers['cache-control']).toBe('private, no-store')
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  test.each([
    ['/jp', '/ja'],
    ['/zh-CN', '/cn'],
    ['/br', '/pt'],
    ['/kr', '/ko'],
  ])('redirects %s to %s', async (from, to_) => {
    const res = await get(from)
    expect(res.statusCode).toBe(301)
    expect(res.headers['cache-control']).toMatch(/max-age=\d+/)
    expect(res.headers.location).toBe(to_)
  })
})
