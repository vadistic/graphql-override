import { DefinitionNode } from 'graphql'

import * as R from 'ramda'
import { GraphqlDefinitionEditor } from './DefinitionEditor'
import { typeSystemHashMap } from './hashmap'
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

export const unhashTypeDefinitions = (defs: Hash<GraphqlDefinitionEditor>) =>
  Object.values(defs).reduce(
    (acc, def) => {
      acc.push(def.node())
      return acc
    },
    [] as SupportedDefinitionNode[]
  )

export const isSupported = (node: DefinitionNode): node is SupportedDefinitionNode =>
  R.has(node.kind, typeSystemHashMap)

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)
