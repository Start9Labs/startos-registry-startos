import { manageSigners } from '../actions/manageSigners'
import { manageRegistries } from '../actions/manageRegistries'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const adminTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await sdk.action.createOwnTask(effects, manageRegistries, 'important', {
    reason: i18n('Name the initial registry.'),
  })
  await sdk.action.createOwnTask(effects, manageSigners, 'important', {
    reason: i18n(
      'Set up signers and administrator rights for enabled registries.',
    ),
  })
})
