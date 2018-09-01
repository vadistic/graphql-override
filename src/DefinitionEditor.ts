import {
  ASTKindToNode,
  DefinitionNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  NamedTypeNode,
  parse,
  print,
} from 'graphql'
import * as R from 'ramda'

import { typeSystemHashMap } from './hashmap'
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

export interface CreateInProp<T extends SupportedDefinitionNode> {
  (prop: 'arguments'): (def: InputValueDefinitionNode) => GraphqlDefinitionEditor<T>
  (prop: 'directives'): (def: DirectiveNode) => GraphqlDefinitionEditor<T>
  (prop: 'fields'): (
    def: FieldDefinitionNode | InputValueDefinitionNode
  ) => GraphqlDefinitionEditor<T>
  (prop: 'interfaces'): (def: NamedTypeNode) => GraphqlDefinitionEditor<T>
  (prop: 'values'): (def: EnumValueDefinitionNode) => GraphqlDefinitionEditor<T>
}

export type UpsertInProp<T extends SupportedDefinitionNode> = CreateInProp<T>

export type DeleteInType<T extends SupportedDefinitionNode> = (
  prop: HashDefinitionNodeKeys
) => (name: string) => GraphqlDefinitionEditor<T>

export class GraphqlDefinitionEditor<
  T extends SupportedDefinitionNode = SupportedDefinitionNode
> {
  // Type assertion only for object initialization
  private hashedNode = {} as HashedDefinitionNode<T>

  constructor(node: SupportedDefinitionNode) {
    if (!isSupported(node)) {
      // Type assertion because error is for non-TS / invalid typings
      throw Error(`Type ${node!.kind} is not supported by  type definition editor`)
    }

    // Hashing all array properties using name as key
    Object.keys(node).forEach(prop => {
      if (typeSystemHashMap[node.kind][prop]) {
        this.hashedNode[prop] = hashArrByName(node[prop])
      } else {
        this.hashedNode[prop] = node[prop]
      }
    })
  }

  // Helper
  public name = () => this.hashedNode.name.value
  public kind = () => this.hashedNode.kind

  public hasProp: HasProp = prop => name => R.has(name, this.hashedNode)

  public hasInProp: ExistInProp = prop => name => R.has(name, this.hashedNode[prop])

  // TODO: Add error message
  public getInProp: GetInProp = prop => name => R.prop(name, this.hashedNode[prop])

  public createInProp: CreateInProp<T> = prop => def => {
    if (!this.hasProp(prop)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    if (this.hasInProp(prop)(def.name.value)) {
      throw new Error(
        `Cannot create ${def.name.value} in ${prop} on type ${this.name()}
        Value with the same name already exist.
        `
      )
    }

    this.hashedNode[prop][def.name.value] = def

    return this
  }

  public upsertInProp: UpsertInProp<T> = prop => def => {
    if (!this.hasProp(prop)) {
      throw new Error(
        `Cannot upsert ${def.name.value} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    this.hashedNode[prop][def.name.value] = def

    return this
  }

  public deleteInProp: DeleteInType<T> = prop => name => {
    if (!this.hasProp(prop)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.name()}
        ${this.kind()} type has no ${prop}.
        `
      )
    }

    if (!this.hasInProp(prop)(name)) {
      throw new Error(
        `Cannot delete ${name} in ${prop} on type ${this.name()}
        Value does not exist.
        `
      )
    }

    this.hashedNode[prop] = R.dissoc(name, this.hashedNode[prop])

    return this
  }

  // Crud
  public hasDirective = this.hasInProp('directives')
  public hasField = this.hasInProp('fields')
  public hasInterface = this.hasInProp('interfaces')
  public hasValue = this.hasInProp('values')

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

  public node = () => {
    const astNode = Object.keys(this.hashedNode).reduce(
      (acc, prop: AllDefinitionNodeKeys) => {
        if (typeSystemHashMap[this.kind()][prop]) {
          acc[prop] = Object.values(this.hashedNode[prop])
        } else {
          acc[prop] = this.hashedNode[prop]
        }
        return acc
      },
      {}
    )
    return astNode as SupportedDefinitionNode
  }

  public print = () => print(this.node())
}