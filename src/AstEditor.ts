import {
  DefinitionNode,
  DocumentNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  Location,
  parse,
  print,
  TypeDefinitionNode,
} from 'graphql'
import * as R from 'ramda'

import { GraphqlTypeEditor } from './TypeEditor'
import { hasName, Mutable, supportedDefinitionNodes } from './util'

export class GraphqlAstEditor {
  public defs: GraphqlTypeEditor[]
  private schema: Mutable<DocumentNode>

  constructor(schema: string | DocumentNode) {
    this.schema = typeof schema === 'string' ? parse(schema) : schema

    this.defs = R.map(
      (def: DefinitionNode) => new GraphqlTypeEditor(def),
      this.schema.definitions
    )
  }

  public typeExist = (name: string) =>
    this.schema.definitions.some(hasName(name))

  public typeIsSupported = (def: DefinitionNode) =>
    R.contains(def.kind, supportedDefinitionNodes)

  public getTypeIndex = (typeName: string) =>
    R.findIndex(R.pathEq(['name', 'value'], typeName))(this.schema.definitions)

  public getType = (typeName: string) =>
    this.schema.definitions[this.getTypeIndex(typeName)]

  public getTypeTest = (typeName: string) =>
    this.defs[this.getTypeIndex(typeName)]

  // Type methods
  public createType = (def: DefinitionNode) => {
    let _def: TypeDefinitionNode

    if (this.typeIsSupported(def)) {
      _def = def as TypeDefinitionNode
    } else {
      throw new Error(
        `Cannot create definition node. Provided unnamed type definition.`
      )
    }

    if (!this.typeExist(_def.name.value)) {
      this.schema.definitions = R.append(_def)(this.schema.definitions)
    } else {
      throw new Error(
        `Cannot create definition node. Type '${_def.name.value}' already exist`
      )
    }
  }

  public replaceType = (def: DefinitionNode) => {
    if (!this.typeIsSupported(def)) {
      throw new Error(
        `Cannot replace definition node. Provided unnamed type definition.`
      )
    }

    def = def as TypeDefinitionNode

    if (this.typeExist(def.name.value)) {
      const index = R.findIndex(
        hasName(def.name.value),
        this.schema.definitions
      )
      this.schema.definitions = R.update(index, def, this.schema.definitions)
    } else {
      throw new Error(
        `Cannot replace node. Type '${def.name.value}' didn't exist`
      )
    }
  }

  public updateType = (def: DefinitionNode) => {
    if (!this.typeIsSupported(def)) {
      throw new Error(`Cannot update node. Provided unnamed type definition.`)
    }

    def = def as TypeDefinitionNode

    let nextDef

    if (!this.typeExist(def.name.value)) {
      throw new Error(
        `Cannot update definition '${def.name.value}'. It doesn't exist`
      )
    }

    const prevDef = this.getType(def.name.value)

    if (prevDef.kind !== def.kind) {
      throw new Error(
        `Cannot update definition '${def.name.value}'. Node Types are different`
      )
    }

    if (
      def.kind === 'UnionTypeDefinition' ||
      def.kind === 'ScalarTypeDefinition'
    ) {
      // Just replace it
      nextDef = def
    }

    if (
      def.kind === 'EnumTypeDefinition' &&
      prevDef.kind === 'EnumTypeDefinition'
    ) {
      nextDef = R.merge(def, {
        description: def.description && prevDef.description,
        values: R.uniqBy((val: EnumValueDefinitionNode) => val.name.value, [
          ...def.values,
          ...prevDef.values,
        ]),
      })
    }

    if (
      def.kind === 'ObjectTypeDefinition' &&
      prevDef.kind === 'ObjectTypeDefinition'
    ) {
      nextDef = R.merge(def, {
        description: def.description && prevDef.description,
        fields: R.uniqBy((field: FieldDefinitionNode) => field.name.value, [
          ...def.fields,
          ...prevDef.fields,
        ]),
      })
    }

    if (
      def.kind === 'InterfaceTypeDefinition' ||
      def.kind === 'InputObjectTypeDefinition'
    ) {
      const typedPrevDef = prevDef as InterfaceTypeDefinitionNode

      nextDef = R.merge(def, {
        description: def.description && typedPrevDef.description,
        fields: R.uniqBy((field: FieldDefinitionNode) => field.name.value, [
          ...def.fields,
          ...typedPrevDef.fields,
        ]),
      })
    }

    this.schema.definitions = R.update(
      this.getTypeIndex(def.name.value),
      nextDef,
      this.schema.definitions
    )
  }

  public deleteType = (name: string) => {
    if (this.typeExist(name)) {
      this.schema.definitions = R.reject(hasName(name))(this.schema.definitions)
    } else {
      throw new Error(`Cannot delete definition '${name}'. It does not exist`)
    }
  }

  // Result methods
  public print() {
    return print(
      R.assoc('definitions', this.defs.map(def => def.node), this.schema)
    )
  }
}
