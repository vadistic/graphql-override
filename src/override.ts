import { readFileSync, statSync } from 'fs'
import {
  ASTKindToNode,
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  Kind,
  KindEnum,
  NameNode,
  parse,
  TokenKind,
  visit,
  Visitor,
  VisitorKeyMap,
} from 'graphql'
import * as p from 'path'
import * as R from 'ramda'
import { GraphqlDocumentEditor } from './DocumentEditor'
import { isFieldDefNode, isTypeDefNode, PropDefNode, TypeDefNode } from './types'
import { tuple, validateSchemaInput } from './util'

interface GraphQLOverrideOptions {
  silent: true
}

type GraphQLOverride = (
  schema: string | DocumentNode,
  overrides: string | DocumentNode,
  options?: GraphQLOverrideOptions
) => DocumentNode

// TODO: How to use with/ instead of my hashmap??
type Keymap = VisitorKeyMap<ASTKindToNode>

export const graphQLOverride: GraphQLOverride = (schema, overrides, options) => {
  const _schema = validateSchemaInput(schema, 'schema')
  const _overrides = validateSchemaInput(overrides, 'overrides')

  const overrideActionTypes = tuple('create', 'update', 'upsert', 'delete')

  type Actions<T> = {
    [P in typeof overrideActionTypes[number]]: Array<
      [{ name: NameNode; kind: KindEnum }, T]
    >
  }

  const fieldActions: Actions<PropDefNode> = {
    create: [],
    update: [],
    upsert: [],
    delete: [],
  }
  const typeActions: Actions<TypeDefNode> = {
    create: [],
    update: [],
    upsert: [],
    delete: [],
  }

  const isOverrideDirective = (node: DirectiveNode) =>
    R.contains(node.name.value, overrideActionTypes)

  const withoutDirective = (
    index: number | string,
    node: PropDefNode | TypeDefNode
  ): PropDefNode | TypeDefNode =>
    R.assoc('directives', R.remove(Number(index), 1, node.directives), node)

  // visit overrides
  visit(_overrides, {
    Directive: (node, key, parent, path, ancestors) => {
      if (isOverrideDirective(node)) {
        const realParent = ancestors[ancestors.length - 1]
        if (isFieldDefNode(realParent)) {
          const realGrandParent = ancestors[ancestors.length - 3] as TypeDefNode
          fieldActions[node.name.value].push([
            R.props(['name', 'kind']),
            withoutDirective(R.last(path), realParent),
          ])
        }
        if (isTypeDefNode(realParent)) {
          typeActions[node.name.value].push([
            R.props(['name', 'kind']),
            withoutDirective(R.last(path), realParent),
          ])
        }
      }
    },
  })

  console.log(fieldActions.update)
  console.log(typeActions.update)

  const SchemaEditor = new GraphqlDocumentEditor(_schema)

  const typeEnum = (kind: string) => {
    if (R.test(/Definition/, kind)) {
      return 'definitions'
    }
    if (R.test(/Extension/, kind)) {
      return 'extensions'
    } else {
      throw new Error(`Invalid action, cannot execute action on type ${kind}`)
    }
  }

  typeActions.create.forEach(([type, def]) => {
    SchemaEditor.createInType(typeEnum(type.kind))(def)
  })

  typeActions.update.forEach(([type, def]) => {
    SchemaEditor.updateInType(typeEnum(type.kind))(def)
  })

  typeActions.upsert.forEach(([type, def]) => {
    SchemaEditor.upsertInType(typeEnum(type.kind))(def)
  })

  typeActions.delete.forEach(([type, def]) => {
    SchemaEditor.deleteInType(typeEnum(type.kind))(type.name.value)
  })

  const fieldEnum = (kind: string) => {
    if (R.test(/Directive/, kind)) {
      return 'directives'
    }
    if (R.test(/(InputValueDefinition|FieldDefinition)/, kind)) {
      return 'fields'
    }
    if (R.test(/EnumValueDefinition/, kind)) {
      return 'values'
    } else {
      throw new Error(`Invalid action, cannot execute action on type ${kind}`)
    }
  }

  fieldActions.create.forEach(([type, field]) => {
    SchemaEditor.getInType(typeEnum(type.kind))(type.name.value).createInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.update.forEach(([type, field]) => {
    SchemaEditor.getInType(typeEnum(type.kind))(type.name.value).createInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.upsert.forEach(([type, field]) => {
    SchemaEditor.getInType(typeEnum(type.kind))(type.name.value).createInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.delete.forEach(([type, field]) => {
    SchemaEditor.getInType(typeEnum(type.kind))(type.name.value).deleteInProp(
      fieldEnum(field.kind)
    )(field.name.value)
  })

  return SchemaEditor.node()
}
