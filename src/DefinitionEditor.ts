import {
  DefinitionNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  NamedTypeNode,
} from 'graphql'
import * as R from 'ramda'

import { definitionHashMap } from './hashmap'
import { HashedDefinitionNode } from './typeguards'
import { hashArrByName, isSupported, SupportedDefinitionNode } from './util'

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

export type HasProp = (prop: HashDefinitionNodeKeys) => (name: string) => boolean

export type ExistInProp = (prop: HashDefinitionNodeKeys) => (name: string) => boolean

export interface GetInProp {
  (prop: 'arguments'): (name: string) => InputValueDefinitionNode
  (prop: 'directives'): (name: string) => DirectiveNode
  (prop: 'fields'): (name: string) => FieldDefinitionNode | InputValueDefinitionNode
  (prop: 'interfaces' | 'types'): (name: string) => NamedTypeNode
  (prop: 'values'): (name: string) => EnumValueDefinitionNode
}

export interface CreateOnType {
  (prop: 'arguments'): (def: InputValueDefinitionNode) => HashedDefinitionNode
  (prop: 'directives'): (def: DirectiveNode) => HashedDefinitionNode
  (prop: 'fields'): (
    def: FieldDefinitionNode | InputValueDefinitionNode
  ) => HashedDefinitionNode
  (prop: 'interfaces'): (def: NamedTypeNode) => HashedDefinitionNode
  (prop: 'values'): (def: EnumValueDefinitionNode) => HashedDefinitionNode
}

export type UpsertOnType = CreateOnType

export type DeleteOnType = (
  prop: HashDefinitionNodeKeys
) => (name: string) => HashedDefinitionNode

export class GraphqlDefinitionEditor {
  private hashNode: HashedDefinitionNode

  constructor(node: DefinitionNode) {
    if (!isSupported(node)) {
      throw Error(`Type ${node.kind} is not supported by (single) type definition editor`)
    }
    // Hashing all properties with named array values by name.value
    Object.keys(node).forEach(prop => {
      if (definitionHashMap[node.kind][prop]) {
        this.hashNode[prop] = hashArrByName(node[prop])
      } else {
        this.hashNode[prop] = node[prop]
      }
    })
  }

  // Helper
  public hasProp: HasProp = prop => name => R.has(name, this.hashNode)

  public existInProp: ExistInProp = prop => name => R.has(name, this.hashNode[prop])

  public getInProp: GetInProp = prop => name => R.prop(name, this.hashNode[prop])

  public createInProp: CreateOnType = prop => def => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.hashNode.name.value}
        ${this.hashNode.kind} type has no ${prop}.
        `
      )
    }

    if (this.existInProp(prop)(def.name.value)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.hashNode.name.value}
        Value with the same name already exist.
        `
      )
    }

    this.hashNode[prop][def.name.value] = def

    return this.hashNode
  }

  public upsertInProp: UpsertOnType = prop => def => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.hashNode.name.value}
        ${this.hashNode.kind} type has no ${prop}.
        `
      )
    }

    this.hashNode[prop][def.name.value] = def

    return this.hashNode
  }

  public deleteInProp: DeleteOnType = prop => name => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.hashNode.name.value}
        ${this.hashNode.kind} type has no ${prop}.
        `
      )
    }

    if (!this.existInProp(prop)(name)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.hashNode.name.value}
        Value does not exist.
        `
      )
    }

    this.hashNode[prop] = R.dissoc(name, this.hashNode[prop])

    return this.hashNode
  }

  // Crud
  public existDirective = this.existInProp('directives')
  public existField = this.existInProp('fields')
  public existInterface = this.existInProp('interfaces')
  public existValue = this.existInProp('values')

  public getDirective = this.getInProp('directives')
  public getField = this.getInProp('fields')
  public getInterface = this.getInProp('interfaces')
  public getValue = this.getInProp('values')

  public createDirective = this.createInProp('directives')
  public createField = this.createInProp('fields')
  public createInterface = this.createInProp('interfaces')
  public createValue = this.createInProp('values')

  public upsertDirective = this.upsertInProp('directives')
  public upsertField = this.upsertInProp('fields')
  public upsertInterface = this.upsertInProp('interfaces')
  public upsertValue = this.upsertInProp('values')

  public deleteDirective = this.deleteInProp('directives')
  public deleteField = this.deleteInProp('fields')
  public deleteInterface = this.deleteInProp('interfaces')
  public deleteValue = this.deleteInProp('values')

  public astNode = () => {
    const astNode = {}
    // Unhashing all arrays by name.value
    Object.keys(this.hashNode).forEach((prop: AllDefinitionNodeKeys) => {
      if (definitionHashMap[this.hashNode.kind][prop]) {
        astNode[prop] = Object.values(this.hashNode[prop])
      } else {
        astNode[prop] = this.hashNode[prop]
      }
    })
  }
}
