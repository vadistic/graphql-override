import {
  ASTKindToNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  Location,
  NamedTypeNode,
  NameNode,
  StringValueNode,
  TypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql'
import * as R from 'ramda'

import { typeSystemHashMap } from './hashmap'
import { tuple } from './util'

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export const propDefNodes = tuple(
  'FieldDefinition',
  'InputValueDefinition',
  'EnumValueDefinition'
)

const typeDefNodes = tuple(
  'ScalarTypeDefinition',
  'ObjectTypeDefinition',
  'InterfaceTypeDefinition',
  'UnionTypeDefinition',
  'EnumTypeDefinition',
  'InputObjectTypeDefinition',
  'ScalarTypeExtension',
  'ObjectTypeExtension',
  'InterfaceTypeExtension',
  'UnionTypeExtension',
  'EnumTypeExtension',
  'InputObjectTypeExtension'
)

export const directiveDefNodes = tuple('DirectiveDefinition')

export type PropDefNode = ASTKindToNode[typeof propDefNodes[number]]
export type TypeDefNode = ASTKindToNode[typeof typeDefNodes[number]]

export type PropNode = PropDefNode | DirectiveNode | NamedTypeNode

export type DirectiveDefNode = ASTKindToNode[typeof directiveDefNodes[number]]

export const isFieldDefNode = (node: object): node is PropDefNode =>
  R.contains(R.propOr('', 'kind', node), propDefNodes)

export const isTypeDefNode = (node: object): node is TypeDefNode =>
  R.contains(R.propOr('', 'kind', node), typeDefNodes)

// Old types
export type SupportedDefinitionNode =
  | TypeDefinitionNode
  | TypeExtensionNode
  | DirectiveDefinitionNode

type KeysOfUnion<T> = T extends any ? keyof T : never

export type AllDefinitionNodeKeys = KeysOfUnion<SupportedDefinitionNode>

export type RegularDefinitionNodeKeys =
  | 'kind'
  | 'loc'
  | 'description'
  | 'name'
  | 'locations'

export type HashDefinitionNodeKeys =
  | 'directives'
  | 'interfaces'
  | 'fields'
  | 'types'
  | 'values'
  | 'arguments'

export interface Hash<T> {
  [name: string]: T
}

export interface HashedDefinitionNode<
  T extends SupportedDefinitionNode = SupportedDefinitionNode
> {
  kind: keyof typeof typeSystemHashMap
  loc?: Location
  description?: 'description' extends keyof T ? StringValueNode : never
  name?: NameNode
  interfaces?: 'interfaces' extends keyof T ? Hash<NamedTypeNode> : never
  types?: 'types' extends keyof T ? Hash<NamedTypeNode> : never
  directives?: 'directives' extends keyof T ? Hash<DirectiveNode> : never
  fields?: 'fields' extends keyof T
    ? Hash<FieldDefinitionNode> | Hash<InputValueDefinitionNode>
    : never
  values?: 'values' extends keyof T ? Hash<EnumValueDefinitionNode> : never
  arguments?: 'arguments' extends keyof T ? Hash<InputValueDefinitionNode> : never
  // not hashing because the name value is missing
  locations: 'locations' extends keyof T ? ReadonlyArray<NameNode> : never
}
