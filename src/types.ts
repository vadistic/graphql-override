import {
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
import { typeSystemHashMap } from './hashmap';

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type SupportedDefinitionNode =
  | TypeDefinitionNode
  | TypeExtensionNode
  | DirectiveDefinitionNode

// Types for keys of DefinitionNode props

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
