import {
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  KindEnum,
  NameNode,
  visit,
} from 'graphql'
import * as R from 'ramda'

import { GraphqlDocumentEditor } from './DocumentEditor'
import {
  ActionTypes,
  actionTypes,
  isFieldDefNode,
  isTypeDefNode,
  PropDefNode,
  SupportedDefinitionNode,
  TypeDefNode,
} from './types'
import { isSupported, validateSchemaInput } from './util'

interface GraphQLOverrideOptions {
  silent: true
}

type GraphQLOverride = (
  schema: string | DocumentNode,
  overrides: string | DocumentNode,
  options?: GraphQLOverrideOptions
) => DocumentNode

export const graphQLOverride: GraphQLOverride = (schema, overrides) => {
  const _schema = validateSchemaInput(schema, 'schema')
  const _overrides = validateSchemaInput(overrides, 'overrides')

  interface ActionTypeInfo {
    name: NameNode
    kind: KindEnum
  }

  type Actions<T> = { [P in ActionTypes]: Array<[ActionTypeInfo, T]> }

  const fieldActions: Actions<PropDefNode> = {
    create: [],
    replace: [],
    upsert: [],
    remove: [],
    delete: [],
  }
  const typeActions: Actions<TypeDefNode> = {
    create: [],
    replace: [],
    upsert: [],
    remove: [],
    delete: [],
  }

  const isActionDirective = (node: DirectiveNode): node is DirectiveNode =>
    R.contains(node.name.value, actionTypes)

  const withoutDirective = (
    index: number | string,
    node: PropDefNode | TypeDefNode
  ): PropDefNode | TypeDefNode =>
    R.assoc('directives', R.remove(Number(index), 1, node.directives), node)

  visit(_overrides, {
    Directive: (node, key, parent, path, ancestors) => {
      if (isActionDirective(node)) {
        const realParent = ancestors[ancestors.length - 1]
        if (isFieldDefNode(realParent)) {
          const realGrandParent = ancestors[
            ancestors.length - 3
          ] as SupportedDefinitionNode
          if (
            // any directive of grandparent (TypeDefinition) is also action directive? => Err
            R.has('directives', realGrandParent) &&
            R.any(isActionDirective)(R.propOr([], 'directives', realGrandParent))
          ) {
            throw new Error(
              `Error while parsing type ${realGrandParent.name.value} overrides.` +
                `Combining type & field override directives results in undetermined behavior and is not supported (yet)`
            )
          }
          fieldActions[node.name.value].push([
            R.pick(['name', 'kind'], realGrandParent),
            withoutDirective(R.last(path), realParent),
          ])
        }
        if (isTypeDefNode(realParent)) {
          typeActions[node.name.value].push([
            R.pick(['name', 'kind'], realParent),
            withoutDirective(R.last(path), realParent),
          ])
        }
      }
    },
  })

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

  typeActions.create.forEach(([info, def]) => {
    SchemaEditor.createInType(typeEnum(info.kind))(def)
  })

  typeActions.replace.forEach(([info, def]) => {
    SchemaEditor.replaceInType(typeEnum(info.kind))(def)
  })

  typeActions.upsert.forEach(([info, def]) => {
    SchemaEditor.upsertInType(typeEnum(info.kind))(def)
  })

  typeActions.delete.forEach(([info]) => {
    SchemaEditor.deleteInType(typeEnum(info.kind))(info.name.value)
  })

  typeActions.remove.forEach(([info]) => {
    SchemaEditor.removeInType(typeEnum(info.kind))(info.name.value)
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

  fieldActions.create.forEach(([info, field]) => {
    SchemaEditor.getInType(typeEnum(info.kind))(info.name.value).createInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.replace.forEach(([info, field]) => {
    SchemaEditor.getInType(typeEnum(info.kind))(info.name.value).replaceInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.upsert.forEach(([info, field]) => {
    SchemaEditor.getInType(typeEnum(info.kind))(info.name.value).upsertInProp(
      fieldEnum(field.kind)
    )(field)
  })

  fieldActions.delete.forEach(([info, field]) => {
    SchemaEditor.getInType(typeEnum(info.kind))(info.name.value).deleteInProp(
      fieldEnum(field.kind)
    )(field.name.value)
  })

  fieldActions.remove.forEach(([info, field]) => {
    SchemaEditor.getInType(typeEnum(info.kind))(info.name.value).removeInProp(
      fieldEnum(field.kind)
    )(field.name.value)
  })

  return SchemaEditor.node()
}
