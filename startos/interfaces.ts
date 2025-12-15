import { sdk } from './sdk'
import { apiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const apiMulti = sdk.MultiHost.of(effects, 'api-multi')
  const apiMultiOrigin = await apiMulti.bindPort(apiPort, {
    protocol: 'http',
  })
  const api = sdk.createInterface(effects, {
    name: 'Web API',
    id: 'api',
    description: 'The web API of your custom registry.',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const apiReceipt = await apiMultiOrigin.export([api])

  return [apiReceipt]
})
