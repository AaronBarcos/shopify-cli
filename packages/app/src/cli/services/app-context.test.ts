import {linkedAppContext} from './app-context.js'
import {fetchSpecifications} from './generate/fetch-extension-specifications.js'
import link from './app/config/link.js'
import {appFromId} from './context.js'

import * as localStorage from './local-storage.js'
import {testOrganizationApp, testDeveloperPlatformClient} from '../models/app/app.test-data.js'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {inTemporaryDirectory, writeFile} from '@shopify/cli-kit/node/fs'
import {joinPath} from '@shopify/cli-kit/node/path'
import {mockAndCaptureOutput} from '@shopify/cli-kit/node/testing/output'
import {isGlobalCLIInstalled} from '@shopify/cli-kit/node/is-global'

vi.mock('./generate/fetch-extension-specifications.js')
vi.mock('./app/config/link.js')
vi.mock('./context.js')
vi.mock('@shopify/cli-kit/node/is-global')

async function writeAppConfig(tmp: string, content: string, packageJsonContent = '{}') {
  const appConfigPath = joinPath(tmp, 'shopify.app.toml')
  const packageJsonPath = joinPath(tmp, 'package.json')
  await writeFile(appConfigPath, content)
  await writeFile(packageJsonPath, packageJsonContent)
}

const mockDeveloperPlatformClient = testDeveloperPlatformClient()
const mockRemoteApp = testOrganizationApp({
  apiKey: 'test-api-key',
  title: 'Test App',
  organizationId: 'test-org-id',
  developerPlatformClient: mockDeveloperPlatformClient,
})

beforeEach(() => {
  vi.mocked(fetchSpecifications).mockResolvedValue([])
  vi.mocked(appFromId).mockResolvedValue(mockRemoteApp)
})

afterEach(() => {
  mockAndCaptureOutput().clear()
})

describe('linkedAppContext', () => {
  test('returns linked app context when app is already linked', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      const content = `client_id="test-api-key"`
      await writeAppConfig(tmp, content)

      // When
      const result = await linkedAppContext({
        directory: tmp,
        forceRelink: false,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })

      // Then
      expect(result).toEqual({
        app: expect.objectContaining({
          configuration: {
            client_id: 'test-api-key',
            path: joinPath(tmp, 'shopify.app.toml'),
          },
        }),
        remoteApp: mockRemoteApp,
        developerPlatformClient: expect.any(Object),
        specifications: [],
      })
      expect(link).not.toHaveBeenCalled()
    })
  })

  test('links app when it is not linked', async () => {
    await inTemporaryDirectory(async (tmp) => {
      const content = ''
      await writeAppConfig(tmp, content)

      // Given
      vi.mocked(link).mockResolvedValue({
        remoteApp: mockRemoteApp,
        state: {
          state: 'connected-app',
          appDirectory: tmp,
          configurationPath: `${tmp}/shopify.app.toml`,
          configSource: 'cached',
          configurationFileName: 'shopify.app.toml',
          basicConfiguration: {client_id: 'test-api-key', path: joinPath(tmp, 'shopify.app.toml')},
        },
        configuration: {
          client_id: 'test-api-key',
          name: 'test-app',
          application_url: 'https://test-app.com',
          path: joinPath(tmp, 'shopify.app.toml'),
        },
      })

      // When
      const result = await linkedAppContext({
        directory: tmp,
        forceRelink: false,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })

      // Then
      expect(result).toEqual({
        app: expect.any(Object),
        remoteApp: mockRemoteApp,
        developerPlatformClient: expect.any(Object),
        specifications: [],
      })
      expect(link).toHaveBeenCalledWith({directory: tmp, apiKey: undefined, configName: undefined})
    })
  })

  test('updates cached app info when remoteApp matches', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      vi.mocked(appFromId).mockResolvedValue({...mockRemoteApp, apiKey: 'test-api-key-new'})
      const content = `client_id="test-api-key-new"`
      await writeAppConfig(tmp, content)
      localStorage.setCachedAppInfo({
        appId: 'test-api-key-old',
        title: 'Test App',
        directory: tmp,
        orgId: 'test-org-id',
      })

      // When
      await linkedAppContext({
        directory: tmp,
        forceRelink: false,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })
      const result = localStorage.getCachedAppInfo(tmp)

      // Then
      expect(link).not.toHaveBeenCalled()

      expect(result).toEqual({
        appId: 'test-api-key-new',
        title: 'Test App',
        directory: expect.any(String),
        orgId: 'test-org-id',
      })
    })
  })

  test('uses provided clientId when available and updates the app configuration', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      const content = `client_id="test-api-key"`
      await writeAppConfig(tmp, content)
      const newClientId = 'new-api-key'

      vi.mocked(appFromId).mockResolvedValue({...mockRemoteApp, apiKey: newClientId})

      // When
      const result = await linkedAppContext({
        directory: tmp,
        clientId: newClientId,
        forceRelink: false,
        userProvidedConfigName: undefined,
        mode: 'report',
      })

      // Then
      expect(link).not.toHaveBeenCalled()
      expect(result.remoteApp.apiKey).toBe(newClientId)
      expect(result.app.configuration.client_id).toEqual('new-api-key')
      expect(appFromId).toHaveBeenCalledWith(expect.objectContaining({apiKey: newClientId}))
    })
  })

  test('resets app when there is a valid toml but reset option is true', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      const content = `client_id="test-api-key"`
      await writeAppConfig(tmp, content)

      vi.mocked(link).mockResolvedValue({
        remoteApp: mockRemoteApp,
        state: {
          state: 'connected-app',
          appDirectory: tmp,
          configurationPath: `${tmp}/shopify.app.toml`,
          configSource: 'cached',
          configurationFileName: 'shopify.app.toml',
          basicConfiguration: {client_id: 'test-api-key', path: joinPath(tmp, 'shopify.app.toml')},
        },
        configuration: {
          client_id: 'test-api-key',
          name: 'test-app',
          application_url: 'https://test-app.com',
          path: joinPath(tmp, 'shopify.app.toml'),
        },
      })

      // When
      await linkedAppContext({
        directory: tmp,
        forceRelink: true,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })

      // Then
      expect(link).toHaveBeenCalledWith({directory: tmp, apiKey: undefined, configName: undefined})
    })
  })

  test('shows a warning when there are multiple installations of the CLI', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      const outputMock = mockAndCaptureOutput()
      const content = `client_id="test-api-key"`
      const packageJsonContent = `{"dependencies": {"@shopify/cli": "3.60.0"}}`
      await writeAppConfig(tmp, content, packageJsonContent)
      vi.mocked(isGlobalCLIInstalled).mockResolvedValue(true)

      // When
      await linkedAppContext({
        directory: tmp,
        forceRelink: false,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })

      // Then
      expect(outputMock.warn()).toMatchInlineSnapshot(`
        "╭─ warning ────────────────────────────────────────────────────────────────────╮
        │                                                                              │
        │  There are two installations of the CLI: global and as a dependency of the   │
        │  project.                                                                    │
        │                                                                              │
        │  We recommend to remove the @shopify/cli and @shopify/app dependencies from  │
        │   your package.json.                                                         │
        │                                                                              │
        ╰──────────────────────────────────────────────────────────────────────────────╯
        "
      `)
    })
  })

  test('does not show the multiple installations warning when there is a single CLI installation', async () => {
    await inTemporaryDirectory(async (tmp) => {
      // Given
      const outputMock = mockAndCaptureOutput()
      const content = `client_id="test-api-key"`
      await writeAppConfig(tmp, content)
      vi.mocked(isGlobalCLIInstalled).mockResolvedValue(true)

      // When
      await linkedAppContext({
        directory: tmp,
        forceRelink: false,
        userProvidedConfigName: undefined,
        clientId: undefined,
        mode: 'report',
      })

      // Then
      expect(outputMock.warn()).toMatchInlineSnapshot(`""`)
    })
  })
})
