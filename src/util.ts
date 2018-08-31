import {
  DefinitionNode,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  TypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql'

import * as R from 'ramda'

// tuple to infer specific union from directiveTypes array instead of just string
export const tuple = <T extends string[]>(...args: T) => args

export const supportedDefinitionNodes = tuple(
  'ObjectTypeDefinition',
  'InputObjectTypeDefinition',
  'InterfaceTypeDefinition',
  'EnumTypeDefinition',
  'ScalarTypeDefinition',
  'UnionTypeDefinition'
)

export type DefinitionNodeWithFields =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)
