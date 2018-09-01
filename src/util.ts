import { DefinitionNode } from 'graphql'

import * as R from 'ramda'
import { definitionHashMap } from './hashmap'
import { Hash, SupportedDefinitionNode } from './types'

export const hashArrByName = <T extends SupportedDefinitionNode>(
  defs: ReadonlyArray<T>
) =>
  defs.reduce(
    (acc, def) => {
      acc[def.name.value] = def
      return acc
    },
    {} as Hash<T>
  )

export const isSupported = (node: DefinitionNode): node is SupportedDefinitionNode =>
  R.has(node.kind, definitionHashMap)

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)
