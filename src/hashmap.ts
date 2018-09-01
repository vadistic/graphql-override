// TypeDefinitionNode
const typeDefinitionNodesHashMap = {
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
const typeExtensionNodeHashMap = {
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
const directiveDefinitionNodeHashMap = {
  kind: false,
  loc: false,
  description: false,
  name: false,
  arguments: true,
  locations: true,
}

export const definitionHashMap = Object.assign(
  {},
  typeDefinitionNodesHashMap,
  typeExtensionNodeHashMap,
  directiveDefinitionNodeHashMap
)
