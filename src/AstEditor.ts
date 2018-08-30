import {
  DefinitionNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  print,
  TypeDefinitionNode,
  TypeSystemDefinitionNode,
} from 'graphql'
import * as R from 'ramda'

import {
  Mutable,
  ObjectDefinitiionNode,
  specificDefinitionNode,
  SupportedDefinitionNode,
  supportedDefinitionNodes,
} from './util'

type DefinitionPredicate = (def: DefinitionNode) => boolean

const hasNameValue = (name: string): DefinitionPredicate =>
  R.pipe(
    R.path(['name', 'value']),
    R.equals(name)
  )

export class AstEditor {
  public schema: Mutable<DocumentNode>

  constructor(schema: string | DocumentNode) {
    this.schema = typeof schema === 'string' ? parse(schema) : schema
  }

  // Logic methods
  public typeExist = (name: string) =>
    this.schema.definitions.some(hasNameValue(name))

  public typeIsSupported = (def: DefinitionNode) =>
    R.contains(def.kind, supportedDefinitionNodes)

  // Type methods
  public createType = (def: DefinitionNode) => {
    let _def: SupportedDefinitionNode

    if (this.typeIsSupported(def)) {
      _def = def as SupportedDefinitionNode
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
    let _def: SupportedDefinitionNode

    if (this.typeIsSupported(def)) {
      _def = def as SupportedDefinitionNode
    } else {
      throw new Error(
        `Cannot replace definition node. Provided unnamed type definition.`
      )
    }

    if (this.typeExist(_def.name.value)) {
      const index = R.findIndex(
        hasNameValue(_def.name.value),
        this.schema.definitions
      )
      this.schema.definitions = R.update(index, def, this.schema.definitions)
    } else {
      throw new Error(
        `Cannot replace node. Type '${_def.name.value}' didn't exist`
      )
    }
  }

  public updateType = (def: DefinitionNode) => {
    if (!this.typeIsSupported(def)) {
      throw new Error(`Cannot update node. Provided unnamed type definition.`)
    }

    const _def = def as SupportedDefinitionNode
    let nextDef

    if (!this.typeExist(_def.name.value)) {
      throw new Error(
        `Cannot update node. Type '${_def.name.value}' doesn't exist`
      )
    }

    const index = R.findIndex(
      hasNameValue(_def.name.value),
      this.schema.definitions
    )

    const prevDef = this.schema.definitions[index]

    if (prevDef.kind !== _def.kind) {
      throw new Error(
        `Cannot update definition node. '${
          _def.name.value
        }' nodes are of diferent type`
      )
    }

    if (
      _def.kind === 'UnionTypeDefinition' ||
      _def.kind === 'ScalarTypeDefinition'
    ) {
      // Just replace it
      nextDef = _def
    }

    if (_def.kind === 'EnumTypeDefinition') {
      const typedPrevDef = prevDef as EnumTypeDefinitionNode

      nextDef = R.merge(_def, {
        description: _def.description && prevDef.description,
        values: R.uniqBy((val: EnumValueDefinitionNode) => val.name.value, [
          ..._def.values,
          ...typedPrevDef.values,
        ]),
      })
    }

    if (_def.kind === 'ObjectTypeDefinition') {
      const typedPrevDef = prevDef as
        | ObjectTypeDefinitionNode
        | InputObjectTypeDefinitionNode

      nextDef = R.merge(_def, {
        description: _def.description && typedPrevDef.description,
        fields: R.uniqBy((field: FieldDefinitionNode) => field.name.value, [
          ..._def.fields,
          ...typedPrevDef.fields,
        ]),
      })
    }

    if (
      _def.kind === 'InterfaceTypeDefinition' ||
      _def.kind === 'InputObjectTypeDefinition'
    ) {
      const typedPrevDef = prevDef as InterfaceTypeDefinitionNode

      nextDef = R.merge(_def, {
        description: _def.description && typedPrevDef.description,
        fields: R.uniqBy((field: FieldDefinitionNode) => field.name.value, [
          ..._def.fields,
          ...typedPrevDef.fields,
        ]),
      })
    }

    this.schema.definitions = R.update(index, nextDef, this.schema.definitions)
  }

  public deleteType = (name: string) => {
    if (this.typeExist(name)) {
      this.schema.definitions = R.reject(hasNameValue(name))(
        this.schema.definitions
      )
    } else {
      throw new Error(`Type '${name}'does not exist and cannot be deleted`)
    }
  }

  // Fields methods

  // Result methods
  public print() {
    return print(this.schema)
  }
}
