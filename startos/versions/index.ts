import { VersionGraph } from '@start9labs/start-sdk'
import { v_0_4_0_1 } from './v0.4.0.1'
import { v_0_4_0_2 } from './v0.4.0.2'

export const versionGraph = VersionGraph.of({
  current: v_0_4_0_2,
  other: [v_0_4_0_1],
})
