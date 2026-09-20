import { sdk } from '../sdk'
import { addAdmin } from './addAdmin'
import { config } from './config'
import { listPackages } from './listPackages'
import { removeAdmin } from './removeAdmin'

export const actions = sdk.Actions.of()
  .addAction(config)
  .addAction(addAdmin)
  .addAction(removeAdmin)
  .addAction(listPackages)
