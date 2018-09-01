import {
  DefinitionNode,
  DirectiveDefinitionNode,
  DocumentNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  Location,
  parse,
  print,
  TypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql'
import * as R from 'ramda'

import { GraphqlDefinitionEditor } from './DefinitionEditor'
import {
  directiveDefinitionHashMap,
  typeDefinitionHashMap,
  typeExtensionHashMap,
  typeSystemHashMap,
} from './hashmap'
import { Hash, SupportedDefinitionNode } from './types'
import { hashArrByName, hasName, isSupported, unhashTypeDefinitions } from './util'

export type TypeDefsVariants = 'directives' | 'definitions' | 'extensions'

export type DefinitionEditorDirective = GraphqlDefinitionEditor<DirectiveDefinitionNode>
export type DefinitionEditorDefinition = GraphqlDefinitionEditor<TypeDefinitionNode>
export type DefinitionEditorExtension = GraphqlDefinitionEditor<TypeExtensionNode>

type ExistInType = (type: TypeDefsVariants) => (name: string) => boolean

interface GetInType {
  (type: 'directives'): (name: string) => DefinitionEditorDirective
  (type: 'definitions'): (name: string) => DefinitionEditorDefinition
  (type: 'extensions'): (name: string) => DefinitionEditorExtension
}

interface CreateInType {
  (type: 'directives'): (node: DirectiveDefinitionNode) => GraphqlTypeDefsEditor
  (type: 'definitions'): (node: TypeDefinitionNode) => GraphqlTypeDefsEditor
  (type: 'extensions'): (node: TypeExtensionNode) => GraphqlTypeDefsEditor
}

type UpsertInType = CreateInType

type UpdateInType = CreateInType

type DeleteInType = (type: TypeDefsVariants) => (name: string) => GraphqlTypeDefsEditor

export class GraphqlTypeDefsEditor {
  private directives: Hash<DefinitionEditorDirective> = {}
  private definitions: Hash<DefinitionEditorDefinition> = {}
  private extensions: Hash<DefinitionEditorExtension> = {}

  private schema: DocumentNode

  constructor(schema: string | DocumentNode) {
    this.schema = typeof schema === 'string' ? parse(schema) : schema

    this.schema.definitions.forEach(node => {
      if (!isSupported(node)) {
        throw new Error(
          `${
            R.has('name', node) ? R.path(['name', 'value'], node) : `Unnamed`
          } node of type '${node!.kind}' is not supported by the editor`
        )
      } else {
        if (R.has(node.kind, directiveDefinitionHashMap)) {
          this.directives[node.name.value] = new GraphqlDefinitionEditor(node)
        }
        if (R.has(node.kind, typeDefinitionHashMap)) {
          this.definitions[node.name.value] = new GraphqlDefinitionEditor(node)
        }
        if (R.has(node.kind, typeExtensionHashMap)) {
          this.extensions[node.name.value] = new GraphqlDefinitionEditor(node)
        }
      }
    })
  }

  public existInType: ExistInType = (type: TypeDefsVariants) => name =>
    R.has(name, this[type])

  public getInType: GetInType = type => name => this[type][name]

  public createInType: CreateInType = type => node => {
    if (this.existInType(type)(node.name.value)) {
      throw new Error(`Cannot create type '${node.name.value}' in ${type}
      Definition with the same name already exists.`)
    } else {
      this[type][node.name.value] = new GraphqlDefinitionEditor(node)
    }
    return this
  }

  public upsertInType: UpsertInType = type => node => {
    this[type][node.name.value] = new GraphqlDefinitionEditor(node)

    return this
  }

  public updateInType: UpdateInType = type => node => {
    if (!this.existInType(type)(node.name.value)) {
      throw new Error(`Cannot update type '${node.name.value}' in ${type}
      Definition with this name does not exist.`)
    } else {
      const prev = this[type][node.name.value]

      const update = new GraphqlDefinitionEditor(node)

      const map = typeSystemHashMap[update.kind()]

      this[type][node.name.value] = Object.assign(
        prev,
        R.pickBy(prop => R.prop(prop, map), update),
        node.description ? { description: node.description } : {}
      )
    }
    return this
  }

  public deleteInType = type => name => {
    if (!this.existInType(type)(name)) {
      throw new Error(`Cannot delete type '${name}' in ${type}
      Definition with this name does not exist.`)
    } else {
      this[type] = R.dissoc(name, this[type])
    }
    return this
  }

  public getDefinition = this.getInType('definitions')
  public getDirective = this.getInType('directives')
  public getExtension = this.getInType('directives')

  public hasDirective = this.existInType('directives')
  public hasDefinition = this.existInType('definitions')
  public hasExtension = this.existInType('extensions')

  public rawNode = () =>
    Object.assign(this.schema, {
      definitions: [
        ...unhashTypeDefinitions(this.directives),
        ...unhashTypeDefinitions(this.definitions),
        ...unhashTypeDefinitions(this.extensions),
      ],
    }) as DocumentNode

  public print = () => print(this.rawNode())

  public node = () => parse(this.print())
}
