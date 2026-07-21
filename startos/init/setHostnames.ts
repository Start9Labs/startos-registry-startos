import { configYaml } from '../fileModels/config.yaml'
import { apiHostId, apiInterfaceId } from '../interfaces'
import { sdk } from '../sdk'

export const setHostnames = sdk.setupOnInit(async (effects) => {
  const allHostnames = await sdk.host
    .getOwn(effects, apiHostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === apiInterfaceId)
      return (
        iface?.addressInfo.nonLocal
          .format('hostname-info')
          .map((h) => h.hostname) || []
      )
    })
    .const()

  const currentHostnames =
    (await configYaml.read((c) => c['registry-hostname']).once()) || []

  if (!arraysEqual(allHostnames, currentHostnames)) {
    await configYaml.merge(effects, { 'registry-hostname': allHostnames })
  }
})

function arraysEqual(a: string[], b: string[]) {
  return (
    a.length === b.length &&
    [...a].sort().every((val, i) => val === [...b].sort()[i])
  )
}
