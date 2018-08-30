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

// tuple to infer specific union from directiveTypes array instead of just string
export const tuple = <T extends string[]>(...args: T) => args

export const supportedDefinitionNodes = tuple('ObjectTypeDefinition')

export type SupportedDefinitionNode =
  | ScalarTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode
  | InputObjectTypeDefinitionNode

export const specificDefinitionNode = (def: SupportedDefinitionNode) => {
  switch (def.kind) {
    case 'ScalarTypeDefinition': {
      return def as ScalarTypeDefinitionNode
    }
    case 'ObjectTypeDefinition': {
      return def as ObjectTypeDefinitionNode
    }
    case 'InterfaceTypeDefinition': {
      return def as InterfaceTypeDefinitionNode
    }
    case 'UnionTypeDefinition': {
      return def as UnionTypeDefinitionNode
    }
    case 'EnumTypeDefinition': {
      return def as EnumTypeDefinitionNode
    }
    case 'InputObjectTypeDefinition': {
      return def as InputObjectTypeDefinitionNode
    }
  }
}

export type ObjectDefinitiionNode =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
