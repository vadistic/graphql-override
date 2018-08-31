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

export const supportedDefinitionNodes = tuple('ObjectTypeDefinition')

export type ObjectLikeDefinitionNode =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export const hasNameValue = (name: string) => R.pathEq(['name', 'value'], name)

// Definition Nodes Typeguards
export const isObjTypeDef = (def: DefinitionNode) =>
  def.kind === 'ObjectTypeDefinition'
export const isInObjTypeDef = (def: DefinitionNode) =>
  def.kind === 'InputObjectTypeDefinition'
export const isInterTypeDef = (def: DefinitionNode) =>
  def.kind === 'InterfaceTypeDefinition'
export const isEnumTypeDef = (def: DefinitionNode) =>
  def.kind === 'EnumTypeDefinition'
export const isScalarTypeDef = (def: DefinitionNode) =>
  def.kind === 'ScalarTypeDefinition'
export const isUnionTypeDef = (def: DefinitionNode) =>
  def.kind === 'UnionTypeDefinition'
