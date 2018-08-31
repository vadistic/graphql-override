import {
  DefinitionNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
} from 'graphql'
import * as R from 'ramda'

import { hasNameValue, ObjectLikeDefinitionNode } from './util'

export class TypeDefinition {
  public def
  constructor(def: DefinitionNode) {
    this.def = def
  }

  public fieldExist = (fieldName: string) => {
    if (
      this.def.kind === 'ObjectTypeDefinition' ||
      this.def.kind === 'InterfaceTypeDefinition'
    ) {
      return this.def.fields.some(hasNameValue(fieldName))
    } else if (this.def.kind === 'InputObjectTypeDefinition') {
      return this.def.fields.some(hasNameValue(fieldName))
    }
  }

  public valueExist = (valueName: string) => {
    if (this.def.kind === 'EnumTypeDefinition') {
      return this.def.values.some(hasNameValue(valueName))
    }
  }

  public getFieldIndex = (fieldName: string) => {
    this.def = this.def as ObjectLikeDefinitionNode
    return R.findIndex(R.pathEq(['name', 'value'], fieldName), this.def.fields)
  }

  public getField = (fieldName: string): FieldDefinitionNode => {
    this.def = this.def as ObjectLikeDefinitionNode
    return R.find(R.pathEq(['name', 'value'], fieldName), this.def.fields)
  }

  public getValueIndex = (valueName: string) => {
    this.def = this.def as EnumTypeDefinitionNode
    return R.findIndex(R.pathEq(['name', 'value'], valueName), this.def.values)
  }

  public getValue = (valueName: string): EnumValueDefinitionNode => {
    this.def = this.def as EnumTypeDefinitionNode
    return R.find(R.pathEq(['name', 'value'], valueName), this.def.values)
  }

  public deleteField = (fieldName: string) => {
    this.def = this.def as ObjectLikeDefinitionNode

    if (!this.fieldExist(fieldName)) {
      throw new Error(
        `Delete Field error!
        Field ${fieldName} on type ${this.def.name.value} does not exists.`
      )
    }

    this.def = R.assoc(
      'fields',
      R.reject(hasNameValue(fieldName), this.def.fields),
      this.def
    )
  }
}
