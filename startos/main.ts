import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { configYaml } from './fileModels/config.yaml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, mountpoint } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting StartOS Registry!'))

  // The fallback port keeps this address constant while tor is absent, so
  // .const() does not restart the registry when tor is installed or removed.
  const torProxy = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()
  // start-registryd parses tor-proxy as a URL; the bridge address is bare host:port.
  await configYaml.merge(effects, { 'tor-proxy': `socks5h://${torProxy}` })

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
