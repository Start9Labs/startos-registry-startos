import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setHostnames } from './setHostnames'
import { adminTasks } from './adminTasks'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  actions,
  dependencies,
  setHostnames,
  adminTasks,
)

export const uninit = sdk.setupUninit(versionGraph)
