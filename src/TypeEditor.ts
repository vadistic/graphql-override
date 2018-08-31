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

import { DefinitionNodeWithFields, HashedDefinitionNode, hasName } from './util'

export class GraphqlTypeEditor {
  public node: HashedDefinitionNode<DefinitionNode>
  constructor(node: DefinitionNode) {
    if (
      this.node.kind === 'ObjectTypeDefinition' ||
      this.node.kind === 'InterfaceTypeDefinition'
    ) {
      this.node = {
        node,
        fields: this.node.fields.reduce((acc, field) => {
          acc[field.name.value] = field
          return acc
        }, {}),
      }
    }
  }

  // Helper Methods

  public fieldExist = (fieldName: string) => {
    if (
      this.node.kind === 'ObjectTypeDefinition' ||
      this.node.kind === 'InterfaceTypeDefinition'
    ) {
      return this.node.fields.some(hasName(fieldName))
    } else if (this.node.kind === 'InputObjectTypeDefinition') {
      return this.node.fields.some(hasName(fieldName))
    }
  }

  public valueExist = (valueName: string) => {
    if (this.node.kind === 'EnumTypeDefinition') {
      return this.node.values.some(hasName(valueName))
    }
  }

  public getFieldIndex = (fieldName: string) => {
    this.node = this.node as DefinitionNodeWithFields
    return R.findIndex(hasName(fieldName), this.node.fields)
  }

  public getField = (fieldName: string): FieldDefinitionNode => {
    this.node = this.node as DefinitionNodeWithFields
    return R.find(hasName(fieldName), this.node.fields)
  }

  public getValueIndex = (valueName: string) => {
    this.node = this.node as EnumTypeDefinitionNode
    return R.findIndex(hasName(valueName), this.node.values)
  }

  public getValue = (valueName: string): EnumValueDefinitionNode => {
    this.node = this.node as EnumTypeDefinitionNode
    return R.find(hasName(valueName), this.node.values)
  }

  // CRUD Methods

  public deleteField = (fieldName: string) => {
    this.node = this.node as DefinitionNodeWithFields

    if (!this.fieldExist(fieldName)) {
      throw new Error(
        `Delete Field error!
        Field ${fieldName} on type ${this.node.name.value} does not exists.`
      )
    }

    this.node = R.assoc(
      'fields',
      R.reject(hasName(fieldName), this.node.fields),
      this.node
    )

    return this.node
  }
}
