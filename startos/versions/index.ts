import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_1_4_0_1 } from './v1.4.0_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_1_4_0_1],
})
