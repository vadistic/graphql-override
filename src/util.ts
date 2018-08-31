import {
  DefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  NamedTypeNode,
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

export type DefinitionNodeWithDescription =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export type DefinitionNodeWithName =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export type DefinitionNodeWithInterfaces = ObjectTypeDefinitionNode

export type DefinitionNodeWithDirectives =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export type DefinitionNodeWithFields =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode

export interface HashedDefinitionNode<
  T extends DefinitionNode = DefinitionNode
> {
  kind: T['kind']
  loc?: T['loc']
  description?: T extends DefinitionNodeWithDescription
    ? T['description']
    : never
  name: T extends DefinitionNodeWithName ? T['name'] : never
  interfaces?: T extends DefinitionNodeWithInterfaces
    ? { [P in keyof T['interfaces'][number]['name']['value']]: NamedTypeNode }
    : never
  directives?: T extends DefinitionNodeWithDirectives
    ? { [P in keyof T['directives'][number]['name']['value']]: DirectiveNode }
    : never
  fields?: T extends DefinitionNodeWithFields
    ? { [P in keyof T['fields'][number]['name']['value']]: FieldDefinitionNode }
    : never
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)
