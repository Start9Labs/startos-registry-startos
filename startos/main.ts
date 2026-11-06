import { Daemons } from '@start9labs/start-sdk'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { configYaml } from './fileModels/config.yaml'
import {
  enabledRegistries,
  registriesJson,
  publishRegistryName,
} from './fileModels/registries.json'
import { i18n } from './i18n'
import { manifest } from './manifest'
import { sdk } from './sdk'
import {
  defaultRegistryId,
  mountpoint,
  registryConfigPath,
  registryDataPath,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting StartOS Registry!'))

  // start-registryd's outbound Tor SOCKS proxy over the bridge. The bridge
  // address only changes on tor install/uninstall/port-change, and the 9050
  // fallback keeps it constant while tor is absent, so this .const() never
  // restarts the registry on tor churn. A dead proxy just connection-refuses,
  // which the registry tolerates.
  const torProxy = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()

  return sdk.Daemons.dynamic(effects, async ({ effects }) => {
    const registries =
      (await registriesJson
        .read((s) =>
          enabledRegistries(s.registries).map(({ id, port, pendingName }) => ({
            id,
            port,
            pendingName,
          })),
        )
        .const(effects)) ?? []
    let daemons: Daemons<typeof manifest, string> = sdk.Daemons.of(effects)
    for (const registry of registries) {
      const config = configYaml(registry)
      // start-registryd parses tor-proxy as a URL; the bridge address is bare host:port.
      await config.merge(effects, { 'tor-proxy': `socks5h://${torProxy}` })

      // start-registryd reads registry-hostname once at startup, so a change has to restart it.
      const hostnames = await config
        .read((c) => c['registry-hostname'])
        .const(effects)
      const daemonId =
        registry.id === defaultRegistryId
          ? 'primary'
          : `registry-${registry.id}`
      daemons = daemons.addDaemon(daemonId as never, {
        subcontainer: sdk.SubContainer.of(
          effects,
          { imageId: 'startos-registry', sharedRun: true },
          sdk.Mounts.of()
            .mountVolume({
              volumeId: 'main',
              subpath: registryDataPath(registry.id),
              mountpoint,
              readonly: false,
            })
            .mountVolume({
              volumeId: 'config',
              subpath: registryConfigPath(registry.id),
              mountpoint: '/etc/startos/config.yaml',
              readonly: false,
              type: 'file',
            }),
          `registry-${registry.id}`,
        ),
        exec: { command: ['start-registryd'] },
        uses: hostnames,
        ready: {
          display: i18n('Web API'),
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, registry.port, {
              successMessage: i18n('The web API is ready'),
              errorMessage: i18n('The API is unreachable'),
            }),
        },
        requires: [],
      })
      daemons = daemons.addOneshot(`publish-name-${registry.id}` as never, {
        subcontainer: null,
        exec: {
          fn: async () => {
            await publishRegistryName(effects, registry.id)
            return null
          },
        },
        uses: registry.pendingName ?? null,
        requires: [daemonId as never],
      })
    }
    return daemons
  })
})
