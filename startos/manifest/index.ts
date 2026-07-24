import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'startos-registry',
  title: 'StartOS Registry',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/startos-registry-startos/',
  upstreamRepo:
    'https://github.com/Start9Labs/start-os/tree/master/projects/start-registry/',
  marketingUrl: 'https://github.com/Start9Labs/start-os/',
  donationUrl: 'https://donate.start9.com/',
  description: { short, long },
  volumes: ['config', 'main'],
  images: {
    'startos-registry': {
      source: { dockerTag: 'ghcr.io/start9labs/startos-registry:master' },
    },
  },
  dependencies: {},
})
