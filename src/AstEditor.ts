import {
  DefinitionNode,
  DocumentNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  Location,
  parse,
  print,
  TypeDefinitionNode,
} from 'graphql'
import * as R from 'ramda'

import { GraphqlDefinitionEditor } from './DefinitionEditor'
import { definitionHashMap } from './hashmap'
import { Hash, SupportedDefinitionNode } from './types'
import { hashArrByName, hasName, isSupported } from './util'

export class GraphqlAstEditor {
  public hashDefs: Hash<GraphqlDefinitionEditor> = {}
  private schema: DocumentNode

  constructor(schema: string | DocumentNode) {
    this.schema = typeof schema === 'string' ? parse(schema) : schema

    this.schema.definitions.forEach(node => {
      if (!isSupported(node)) {
        throw Error(`Type ${node.kind} is not supported by type definition editor`)
      } else {
        this.hashDefs[node.name.value] = new GraphqlDefinitionEditor(node)
      }
    })
  }

  public astNode = () => ({
    ...this.schema,
    definitions: Object.values(this.hashDefs).reduce((acc, def) => {
      acc.push(def.astNode())
      return acc
    }, []),
  })

  public print = () => print(this.astNode())
}
