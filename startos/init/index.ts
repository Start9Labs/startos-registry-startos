import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedRegistries, setHostnames } from './setHostnames'
import { adminTasks } from './adminTasks'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedRegistries,
  setInterfaces,
  actions,
  dependencies,
  setHostnames,
  adminTasks,
)

export const uninit = sdk.setupUninit(versionGraph)
