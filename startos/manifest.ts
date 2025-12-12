import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'startos-registry',
  title: 'StartOS Registry',
  license: 'MIT',
  wrapperRepo: 'https://github.com/Start9Labs/startos-registry-startos/',
  upstreamRepo:
    'https://github.com/Start9Labs/start-os/tree/master/core/startos/src/registry/',
  supportSite: 'https://github.com/Start9Labs/start-os/issues',
  marketingSite: 'https://github.com/Start9Labs/start-os/',
  donationUrl: 'https://donate.start9.com/',
  docsUrl:
    'https://github.com/Start9Labs/startos-registry-startos/blob/master/instructions.md',
  description: {
    short: 'Host your own StartOS registry',
    long: 'Curate a list of your favorite StartOS services and distribute to friends and family through your own registry.',
  },
  volumes: ['main'],
  images: {
    'startos-registry': {
      source: { dockerTag: 'ghcr.io/start9labs/startos-registry:next-major' },
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
