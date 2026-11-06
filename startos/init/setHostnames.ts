import { configYaml } from '../fileModels/config.yaml'
import { activeRegistries, registriesJson } from '../fileModels/registries.json'
import { sdk } from '../sdk'
import { registryHostId, registryInterfaceId } from '../utils'

export const seedRegistries = sdk.setupOnInit(async (effects) => {
  await registriesJson.merge(effects, {})
})

export const setHostnames = sdk.setupOnInit(async (effects) => {
  const registries = (await activeRegistries().const(effects)) ?? []
  for (const registry of registries) {
    const hostnames = await sdk.host
      .getOwn(effects, registryHostId(registry.id), (host) => {
        const iface = Object.values(host?.bindings ?? {})
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === registryInterfaceId(registry.id))
        return [
          ...new Set(
            iface?.addressInfo.nonLocal
              .format('hostname-info')
              .map((h) => h.hostname) ?? [],
          ),
        ].sort()
      })
      .const()
    await configYaml(registry).merge(effects, {
      'registry-hostname': hostnames,
    })
  }
})
