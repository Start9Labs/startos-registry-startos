import { configYaml } from '../fileModels/config.yaml'
import { sdk } from '../sdk'

export const setHostnames = sdk.setupOnInit(async (effects) => {
  const iface = await sdk.serviceInterface.getOwn(effects, 'api').const()
  const allHostnames =
    iface?.addressInfo?.nonLocal
      .format('hostname-info')
      .map((h) => h.hostname.value) || []

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
