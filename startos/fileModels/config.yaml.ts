import { matches, FileHelper } from '@start9labs/start-sdk'
import { apiPort, mountpoint } from '../utils'

const { object, string, arrayOf, literal } = matches

const registryListen = `0.0.0.0:${apiPort}`
const torProxy = 'socks5h://10.0.3.1:9050'

const shape = object({
  'registry-hostname': arrayOf(string).onMismatch([]),
  'registry-listen': literal(registryListen).onMismatch(registryListen),
  'tor-proxy': literal(torProxy).onMismatch(torProxy),
  datadir: literal(mountpoint).onMismatch(mountpoint),
})

export const configYaml = FileHelper.yaml(
  { volumeId: 'config', subpath: './config.yaml' },
  shape,
)
