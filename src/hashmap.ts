// TypeDefinitionNode
export const typeDefinitionHashMap = {
  ScalarTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    directives: true,
  },
  ObjectTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    interfaces: true,
    directives: true,
    fields: true,
  },
  InterfaceTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    directives: true,
    fields: true,
  },
  UnionTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    directives: true,
  },
  EnumTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    directives: true,
    values: true,
  },
  InputObjectTypeDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    directives: true,
    fields: true,
  },
}

// TypeExtensionNode
export const typeExtensionHashMap = {
  ScalarTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    directives: true,
  },
  ObjectTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    interfaces: true,
    directives: true,
    fields: true,
  },
  InterfaceTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    directives: true,
    fields: true,
  },
  UnionTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    directives: true,
  },
  EnumTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    directives: true,
    values: true,
  },
  InputObjectTypeExtension: {
    kind: false,
    loc: false,
    name: false,
    directives: true,
    fields: true,
  },
}

// DirectiveDefinitionNode
export const directiveDefinitionHashMap = {
  DirectiveDefinition: {
    kind: false,
    loc: false,
    description: false,
    name: false,
    arguments: true,
    locations: true,
  },
}

export const typeSystemHashMap = Object.assign(
  {},
  typeDefinitionHashMap,
  typeExtensionHashMap,
  directiveDefinitionHashMap
)
