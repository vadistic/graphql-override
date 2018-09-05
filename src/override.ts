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
import { validateSchemaInput } from './util'

// TODO: add options
export interface GraphQLOverrideOptions {
  useImport?: boolean
}

const defaultOptions = {
  useImport: true,
}

export type GraphQLOverride = (
  schema: string | DocumentNode,
  overrides: string | DocumentNode,
  options?: GraphQLOverrideOptions
) => DocumentNode

export const graphQLOverride: GraphQLOverride = (
  schema,
  overrides,
  { useImport } = defaultOptions
) => {
  const _schema = validateSchemaInput(schema, { inputName: 'schema', useImport })
  const _overrides = validateSchemaInput(overrides, { inputName: 'overrides', useImport })

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
    extend: [],
    exclude: [],
  }
  const typeActions: Actions<TypeDefNode> = {
    create: [],
    replace: [],
    upsert: [],
    remove: [],
    delete: [],
    extend: [],
    exclude: [],
  }

  const isActionDirective = (node: DirectiveNode): node is DirectiveNode =>
    R.contains(node.name.value, actionTypes)

  const hasActionDirective = (node: DefinitionNode): node is TypeDefNode =>
    R.any(isActionDirective)(R.propOr([], 'directives', node))

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
          if (!isTypeDefNode(realGrandParent)) {
            throw new Error(
              `Cannot parse directive '${node.name.value}' on ${
                realParent.name.value
              }.\n` + `Parent node is not Type System Definition/Extension Node!`
            )
          }
          if (hasActionDirective(realGrandParent)) {
            throw new Error(
              `Cannot parse type '${realGrandParent.name.value}' in overrides.\n` +
                `Combining type & field override directives results in undetermined behavior and is not supported (yet)!`
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
      throw new Error(`Override action on invalid type: '${kind}'.`)
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

  typeActions.delete.forEach(([info, def]) => {
    SchemaEditor.deleteInType(typeEnum(info.kind))(def.name.value)
  })

  typeActions.remove.forEach(([info, def]) => {
    SchemaEditor.removeInType(typeEnum(info.kind))(def.name.value)
  })

  typeActions.extend.forEach(([info, def]) => {
    SchemaEditor.extendInType(typeEnum(info.kind))(def)
  })

  typeActions.exclude.forEach(([info, def]) => {
    SchemaEditor.excludeInType(typeEnum(info.kind))(def)
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
      throw new Error(`Override action on invalid type: '${kind}'.`)
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
