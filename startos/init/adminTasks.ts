import { manageSigners } from '../actions/manageSigners'
import { config } from '../actions/config'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const adminTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await sdk.action.createOwnTask(effects, config, 'important', {
    reason: i18n('Set basic information about your registry'),
  })
  await sdk.action.createOwnTask(effects, manageSigners, 'important', {
    reason: i18n('Add an administrator to your registry'),
  })
})
