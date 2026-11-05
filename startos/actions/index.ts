import { sdk } from '../sdk'
import { manageSigners } from './manageSigners'
import { manageRegistries } from './manageRegistries'
import { config } from './config'
import { listPackages } from './listPackages'
import { securityNotifications } from './securityNotifications'

export const actions = sdk.Actions.of()
  .addAction(manageRegistries)
  .addAction(config)
  .addAction(manageSigners)
  .addAction(listPackages)
  .addAction(securityNotifications)
