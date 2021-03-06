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

export type Literal = string | number | boolean | undefined | null | void | {}
export const tuple = <T extends Literal[]>(...args: T) => args

export const actionTypes = tuple(
  'create',
  'replace',
  'upsert',
  'remove',
  'delete',
  'extend',
  'exclude'
)

export type ActionTypes = typeof actionTypes[number]

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

export type DirectiveDefinitionNode = ASTKindToNode[typeof directiveDefNodes[number]]

export type HasKind<T> = T & {
  kind: string
}

export const hasKindProp = <T extends object>(obj: T): obj is HasKind<T> =>
  Object.prototype.hasOwnProperty.call(obj, 'kind')

export const isFieldDefNode = (node: object): node is PropDefNode =>
  hasKindProp(node) && (propDefNodes as string[]).includes(node.kind)

export const isTypeDefNode = (node: object): node is TypeDefNode =>
  hasKindProp(node) && (typeDefNodes as string[]).includes(node.kind)

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
