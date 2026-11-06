import { activeRegistries } from './fileModels/registries.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  registryDisplayName,
  registryHostId,
  registryInterfaceId,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const registries = (await activeRegistries().const(effects)) ?? []
  const receipts = []
  for (const registry of registries) {
    const origin = await sdk.MultiHost.of(
      effects,
      registryHostId(registry.id),
    ).bindPort(registry.port, { protocol: 'http' })
    receipts.push(
      await origin.export([
        sdk.createInterface(effects, {
          name: i18n('Web API — ${registry}', {
            registry: registryDisplayName(registry),
          }),
          id: registryInterfaceId(registry.id),
          description: i18n(
            'Use this API address with start-cli to publish packages or add it as a registry source on another StartOS server.',
          ),
          type: 'api',
          masked: false,
          schemeOverride: null,
          username: null,
          path: '',
          query: {},
        }),
      ]),
    )
  }
  return receipts
})
