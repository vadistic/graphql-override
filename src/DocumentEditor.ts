import {
  DirectiveDefinitionNode,
  DocumentNode,
  parse,
  print,
  TypeDefinitionNode,
  TypeExtensionNode,
} from 'graphql'
import * as R from 'ramda'

import {
  directiveDefinitionHashMap,
  typeDefinitionHashMap,
  typeExtensionHashMap,
  typeSystemHashMap,
} from './hashmap'
import { GraphqlTypeEditor } from './TypeEditor'
import { Hash, SupportedDefinitionNode } from './types'
import { isSupported, unhashTypeDefinitions, validateSchemaInput } from './util'

export type TypeDefsVariants = 'directives' | 'definitions' | 'extensions'

export type TypeEditorDirective = GraphqlTypeEditor<DirectiveDefinitionNode>
export type TypeEditorDefinition = GraphqlTypeEditor<TypeDefinitionNode>
export type TypeEditorExtension = GraphqlTypeEditor<TypeExtensionNode>

type HasInType = (type: TypeDefsVariants) => (name: string) => boolean

interface GetInType {
  (type: 'directives'): (name: string) => TypeEditorDirective
  (type: 'definitions'): (name: string) => TypeEditorDefinition
  (type: 'extensions'): (name: string) => TypeEditorExtension
  (type: 'definitions' | 'extensions' | 'directives'): (name: string) => GraphqlTypeEditor
}

interface ActionInType {
  (type: 'definitions'): (node: TypeDefinitionNode) => GraphqlDocumentEditor
  (type: 'extensions'): (node: TypeExtensionNode) => GraphqlDocumentEditor
  (type: 'directives'): (node: DirectiveDefinitionNode) => GraphqlDocumentEditor
  (type: 'definitions' | 'extensions' | 'directives'): (
    node: SupportedDefinitionNode
  ) => GraphqlDocumentEditor
}

type DeleteInType = (type: TypeDefsVariants) => (name: string) => GraphqlDocumentEditor
type RemoveInType = DeleteInType

export class GraphqlDocumentEditor {
  private directives: Hash<TypeEditorDirective> = {}
  private definitions: Hash<TypeEditorDefinition> = {}
  private extensions: Hash<TypeEditorExtension> = {}

  private schema: DocumentNode

  constructor(schema: string | DocumentNode) {
    this.schema = validateSchemaInput(schema)

    this.schema.definitions.forEach(node => {
      if (!isSupported(node)) {
        throw new Error(
          `${
            R.has('name', node) ? R.path(['name', 'value'], node) : `Unnamed`
          } node of type '${node!.kind}' is not supported by the editor`
        )
      }
      if (R.has(node.kind, directiveDefinitionHashMap)) {
        this.directives[node.name.value] = new GraphqlTypeEditor(node)
      }
      if (R.has(node.kind, typeDefinitionHashMap)) {
        this.definitions[node.name.value] = new GraphqlTypeEditor(node)
      }
      if (R.has(node.kind, typeExtensionHashMap)) {
        this.extensions[node.name.value] = new GraphqlTypeEditor(node)
      }
    })
  }

  public hasInType: HasInType = (type: TypeDefsVariants) => name =>
    R.has(name, this[type])

  public getInType: GetInType = type => name => this[type][name]

  public createInType: ActionInType = type => node => {
    if (this.hasInType(type)(node.name.value)) {
      throw new Error(
        `Cannot create type '${node.name.value}' in ${type}` +
          `Definition with the same name already exists.`
      )
    }

    this.upsertInType(type)(node)

    return this
  }

  public replaceInType: ActionInType = type => node => {
    if (!this.hasInType(type)(node.name.value)) {
      throw new Error(
        `Cannot replace type '${node.name.value}' in ${type}` +
          `Definition with this name does not exist.`
      )
    }

    this.upsertInType(type)(node)

    return this
  }

  public upsertInType: ActionInType = type => node => {
    this[type][node.name.value] = new GraphqlTypeEditor(node)

    return this
  }

  public deleteInType: DeleteInType = type => name => {
    this[type] = R.dissoc(name, this[type])

    return this
  }

  public removeInType: RemoveInType = type => name => {
    if (!this.hasInType(type)(name)) {
      throw new Error(
        `Cannot delete type '${name}' in ${type}` +
          `Definition with this name does not exist.`
      )
    }

    this.deleteInType(type)(name)

    return this
  }

  public getDefinition = this.getInType('definitions')
  public getDirective = this.getInType('directives')
  public getExtension = this.getInType('directives')

  public hasDirective = this.hasInType('directives')
  public hasDefinition = this.hasInType('definitions')
  public hasExtension = this.hasInType('extensions')

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
