import {
  ASTKindToNode,
  DefinitionNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  NamedTypeNode,
  print,
} from 'graphql'
import * as R from 'ramda'

import { definitionHashMap } from './hashmap'
import {
  AllDefinitionNodeKeys,
  HashDefinitionNodeKeys,
  HashedDefinitionNode,
  SupportedDefinitionNode,
} from './types'
import { hashArrByName, isSupported } from './util'

export type HasProp = (prop: HashDefinitionNodeKeys) => (name: string) => boolean

export type ExistInProp = (prop: HashDefinitionNodeKeys) => (name: string) => boolean

export interface GetInProp {
  (prop: 'arguments'): (name: string) => InputValueDefinitionNode
  (prop: 'directives'): (name: string) => DirectiveNode
  (prop: 'fields'): (name: string) => FieldDefinitionNode | InputValueDefinitionNode
  (prop: 'interfaces' | 'types'): (name: string) => NamedTypeNode
  (prop: 'values'): (name: string) => EnumValueDefinitionNode
}

export interface CreateOnType<T extends SupportedDefinitionNode> {
  (prop: 'arguments'): (def: InputValueDefinitionNode) => GraphqlDefinitionEditor<T>
  (prop: 'directives'): (def: DirectiveNode) => GraphqlDefinitionEditor<T>
  (prop: 'fields'): (
    def: FieldDefinitionNode | InputValueDefinitionNode
  ) => GraphqlDefinitionEditor<T>
  (prop: 'interfaces'): (def: NamedTypeNode) => GraphqlDefinitionEditor<T>
  (prop: 'values'): (def: EnumValueDefinitionNode) => GraphqlDefinitionEditor<T>
}

export type UpsertOnType<T extends SupportedDefinitionNode> = CreateOnType<T>

export type DeleteOnType<T extends SupportedDefinitionNode> = (
  prop: HashDefinitionNodeKeys
) => (name: string) => GraphqlDefinitionEditor<T>

export class GraphqlDefinitionEditor<
  T extends SupportedDefinitionNode = SupportedDefinitionNode
> {
  // Type assertion for object initialization
  private hashNode = {} as HashedDefinitionNode<T>

  constructor(node: SupportedDefinitionNode) {
    if (!isSupported(node)) {
      // Type assertion because error is for non-TS / invalid typings
      throw Error(`Type ${node!.kind} is not supported by  type definition editor`)
    }

    // Hashing all array properties using name as key
    Object.keys(node).forEach(prop => {
      if (definitionHashMap[node.kind][prop]) {
        this.hashNode[prop] = hashArrByName(node[prop])
      } else {
        this.hashNode[prop] = node[prop]
      }
    })
  }

  // Helper
  public name = () => this.hashNode.name.value
  public kind = () => this.hashNode.kind

  public hasProp: HasProp = prop => name => R.has(name, this.hashNode)

  public existInProp: ExistInProp = prop => name => R.has(name, this.hashNode[prop])

  public getInProp: GetInProp = prop => name => R.prop(name, this.hashNode[prop])

  public createInProp: CreateOnType<T> = prop => def => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    if (this.existInProp(prop)(def.name.value)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.name()}
        Value with the same name already exist.
        `
      )
    }

    this.hashNode[prop][def.name.value] = def

    return this
  }

  public upsertInProp: UpsertOnType<T> = prop => def => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    this.hashNode[prop][def.name.value] = def

    return this
  }

  public deleteInProp: DeleteOnType<T> = prop => name => {
    if (!R.has(prop, this.hashNode)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    if (!this.existInProp(prop)(name)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.name()}
        Value does not exist.
        `
      )
    }

    this.hashNode[prop] = R.dissoc(name, this.hashNode[prop])

    return this
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
    const astNode = Object.keys(this.hashNode).reduce(
      (acc, prop: AllDefinitionNodeKeys) => {
        if (definitionHashMap[this.kind()][prop]) {
          acc[prop] = Object.values(this.hashNode[prop])
        } else {
          acc[prop] = this.hashNode[prop]
        }
        return acc
      },
      {}
    )
    return astNode as SupportedDefinitionNode
  }

  public print = () => print(this.astNode())
}
