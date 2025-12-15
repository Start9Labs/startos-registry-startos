import { sdk } from './sdk'
import { apiPort } from './utils'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting StartOS Registry!')

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */
  return sdk.Daemons.of(effects, started).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'startos-registry' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/var/lib/startos',
        readonly: false,
      }),
      'startos-registry-sub',
    ),
    exec: { command: ['start-registry'] },
    ready: {
      display: 'Web API',
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, apiPort, {
          successMessage: 'The web API is ready',
          errorMessage: 'The API is unreachable',
        }),
    },
    requires: [],
  })
})
