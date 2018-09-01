import {
  DefinitionNode,
  DirectiveDefinitionNode,
  TypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql'

import * as R from 'ramda'
import { definitionHashMap } from './hashmap'

// tuple to infer specific union from directiveTypes array instead of just string
export const tuple = <T extends string[]>(...args: T) => args

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export interface HashableTypeProps {
  name: {
    value: string
  }
}

export interface HashedTypeProp<T extends HashableTypeProps> {
  [name: string]: T
}

export type SupportedDefinitionNode =
  | TypeDefinitionNode
  | TypeExtensionNode
  | DirectiveDefinitionNode

export const hashArrByName = <T extends HashableTypeProps>(defs: ReadonlyArray<T>) =>
  defs.reduce(
    (acc, def) => {
      acc[def.name.value] = def
      return acc
    },
    {} as HashedTypeProp<T>
  )

export const isSupported = (node: DefinitionNode) => R.has(node.kind, definitionHashMap)

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)
