import {buildBaseStorefrontUrl} from './storefront-renderer.js'
import {getStorefrontSessionCookies} from './storefront-session.js'
import {DevServerSession} from './types.js'
import {outputDebug} from '@shopify/cli-kit/node/output'
import {AdminSession, ensureAuthenticatedStorefront, ensureAuthenticatedThemes} from '@shopify/cli-kit/node/session'
import {AbortError} from '@shopify/cli-kit/node/error'
import {fetchThemeAssets, themeDelete} from '@shopify/cli-kit/node/themes/api'

// 30 minutes in miliseconds.
const SESSION_TIMEOUT_IN_MS = 30 * 60 * 1000
const REQUIRED_THEME_FILES = ['layout/theme.liquid', 'config/settings_schema.json']
const RETRY_DELAY_MS = 3000

/**
 * Initialize the session object, which is automatically refreshed
 * every 30 minutes.
 *
 * @param themeId            - The theme being rendered in this session.
 * @param adminSession       - Admin session with the initial access token and store.
 * @param adminPassword      - Custom app password or password generated by the Theme Access app.
 * @param storefrontPassword - Storefront password set in password-protected stores.
 *
 * @returns Details about the app configuration state.
 */
export async function initializeDevServerSession(
  themeId: string,
  adminSession: AdminSession,
  adminPassword?: string,
  storefrontPassword?: string,
) {
  await verifyRequiredFilesExist(themeId, adminSession)

  const session = await fetchDevServerSession(themeId, adminSession, adminPassword, storefrontPassword)

  setInterval(() => {
    fetchDevServerSession(themeId, adminSession, adminPassword, storefrontPassword)
      .then((newSession) => {
        outputDebug('Refreshing theme session...')
        Object.assign(session, newSession)
      })
      .catch(() => {
        outputDebug('Session could not be refreshed.')
      })
  }, SESSION_TIMEOUT_IN_MS)

  return session
}

export async function verifyRequiredFilesExist(themeId: string, adminSession: AdminSession) {
  outputDebug(`Verifying required files for theme ${themeId}...`)

  const themeIdNumber = Number(themeId)

  const areFilesPresent = async () => {
    const assets = await fetchThemeAssets(themeIdNumber, REQUIRED_THEME_FILES, adminSession)
    return assets.length === REQUIRED_THEME_FILES.length
  }

  const hasFiles = await areFilesPresent()
  if (!hasFiles) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))

    const hasFilesAfterRetry = await areFilesPresent()
    if (!hasFilesAfterRetry) {
      await themeDelete(themeIdNumber, adminSession)
      throw new AbortError('Invalid theme removed from storefront. Please try deleting the theme and recreating it.')
    }
  }
}

async function fetchDevServerSession(
  themeId: string,
  adminSession: AdminSession,
  adminPassword?: string,
  storefrontPassword?: string,
): Promise<DevServerSession> {
  const baseUrl = buildBaseStorefrontUrl(adminSession)

  const session = await ensureAuthenticatedThemes(adminSession.storeFqdn, adminPassword, [])
  const storefrontToken = await ensureAuthenticatedStorefront([], adminPassword)
  const sessionCookies = await getStorefrontSessionCookies(baseUrl, themeId, storefrontPassword, {
    'X-Shopify-Shop': session.storeFqdn,
    'X-Shopify-Access-Token': session.token,
    Authorization: `Bearer ${storefrontToken}`,
  })

  return {
    ...session,
    sessionCookies,
    storefrontToken,
  }
}
