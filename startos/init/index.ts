import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setHostnames } from './setHostnames'
import { adminTasks } from './adminTasks'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  setHostnames,
  adminTasks,
)

export const uninit = sdk.setupUninit(versionGraph)
