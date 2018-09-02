import { readFileSync, statSync } from 'fs'
import {
  ASTKindToNode,
  DocumentNode,
  parse,
  visit,
  Visitor,
  VisitorKeyMap,
} from 'graphql'
import * as R from 'ramda'
import { GraphqlTypeDefsEditor } from './TypeDefsEditor'
import { validateSchemaInput } from './util'

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
  const _directives = readFileSync(path.join(__dirname, 'directives.graphql'), 'utf8')
  const _schema = validateSchemaInput(schema, 'schema')
  const _overrides = validateSchemaInput(overrides, 'overrides')

  const test = visit(_overrides, {
    DirectiveDefinition: (node, key, parent, path, ancestors) => {
      console.log('visited directive')
      console.log()
    },
  })

  return _schema
}
