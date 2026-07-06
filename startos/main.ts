import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { configYaml } from './fileModels/config.yaml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, bridgeAddress, mountpoint } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting StartOS Registry!'))

  // start-registryd's outbound Tor SOCKS proxy over the bridge. The mapped
  // address only changes on tor install/uninstall/port-change, and the 9050
  // fallback keeps it constant while tor is absent, so this .const() never
  // restarts the registry on tor churn. A dead proxy just connection-refuses,
  // which the registry tolerates.
  const torProxy = await bridgeAddress(effects, {
    packageId: 'tor',
    hostId: socksHostId,
    internalPort: socksPort,
    fallbackPort: socksPort,
  }).const()
  await configYaml.merge(effects, { 'tor-proxy': torProxy })

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'startos-registry', sharedRun: true },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'main',
          subpath: null,
          mountpoint,
          readonly: false,
        })
        .mountVolume({
          volumeId: 'config',
          subpath: '/config.yaml',
          mountpoint: '/etc/startos/config.yaml',
          readonly: false,
          type: 'file',
        }),
      'startos-registry-sub',
    ),
    exec: { command: ['start-registryd'] },
    ready: {
      display: i18n('Web API'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, apiPort, {
          successMessage: i18n('The web API is ready'),
          errorMessage: i18n('The API is unreachable'),
        }),
    },
    requires: [],
  })
})
