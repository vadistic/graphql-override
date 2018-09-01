import {
  DefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql'

export type TypeDefinitionNode =
  | EnumTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | ScalarTypeDefinitionNode
  | UnionTypeDefinitionNode

export const typeDefinitionNode = [
  'EnumTypeDefinition',
  'InputObjectTypeDefinition',
  'InterfaceTypeDefinition',
  'ObjectTypeDefinition',
  'ScalarTypeDefinition',
  'UnionTypeDefinition',
]

export const isTypeDefinitionNode = (
  node: DefinitionNode | HashedDefinitionNode
): node is TypeDefinitionNode => typeDefinitionNode.includes(node.kind)

export type DefinitionNodeWithInterfaces = ObjectTypeDefinitionNode

export const definitionNodeWithInterfaces = ['ObjectTypeDefinition']

export const isDefinitionNodeWithInterfaces = (
  node: DefinitionNode | HashedDefinitionNode
): node is DefinitionNodeWithInterfaces => definitionNodeWithInterfaces.includes(node.kind)

export type DefinitionNodeWithFields = ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode

export const definitionNodeWithFields = ['InterfaceTypeDefinition', 'ObjectTypeDefinition']

export const isDefinitionNodeWithFields = (
  node: DefinitionNode | HashedDefinitionNode
): node is DefinitionNodeWithFields => definitionNodeWithFields.includes(node.kind)

export type DefinitionNodeWithInputValues = InputObjectTypeDefinitionNode

export const definitionNodeWithInputValues = ['InputObjectTypeDefinition']

export const isDefinitionNodeWithInputValues = (
  node: DefinitionNode | HashedDefinitionNode
): node is DefinitionNodeWithInputValues => definitionNodeWithInputValues.includes(node.kind)

export type DefinitionNodeWithValues = EnumTypeDefinitionNode

export const definitionNodeWithValues = ['EnumTypeDefinition']

export const isDefinitionNodeWithValues = (
  node: DefinitionNode | HashedDefinitionNode
): node is DefinitionNodeWithValues => definitionNodeWithValues.includes(node.kind)

export interface HashedDefinitionNode<T extends DefinitionNode = DefinitionNode> {
  kind: T['kind']
  loc?: T['loc']
  description?: T extends TypeDefinitionNode ? T['description'] : never
  name?: T extends TypeDefinitionNode ? T['name'] : never
  interfaces?: T extends DefinitionNodeWithInterfaces ? { [name: string]: NamedTypeNode } : never
  directives?: T extends TypeDefinitionNode ? { [name: string]: DirectiveNode } : never
  fields?: T extends DefinitionNodeWithFields
    ? { [name: string]: FieldDefinitionNode }
    : T extends DefinitionNodeWithInputValues
      ? {
          [name: string]: InputValueDefinitionNode
        }
      : never
  values?: T extends DefinitionNodeWithValues
    ? {
        [name: string]: EnumValueDefinitionNode
      }
    : never
}
