import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { sdk } from '../sdk'
import { config } from '../actions/config'
import { addAdmin } from '../actions/addAdmin'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    await sdk.action.createOwnTask(effects, config, 'important', {
      reason: 'Set basic information about your registry',
    })
    await sdk.action.createOwnTask(effects, addAdmin, 'important', {
      reason: 'Add an administrator to your registry',
    })
  },
})
