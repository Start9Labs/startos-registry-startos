import { sdk } from '../sdk'
import { manageSigners } from './manageSigners'
import { manageRegistries } from './manageRegistries'
import { config } from './config'
import { listPackages } from './listPackages'

export const actions = sdk.Actions.of()
  .addAction(manageRegistries)
  .addAction(config)
  .addAction(manageSigners)
  .addAction(listPackages)
