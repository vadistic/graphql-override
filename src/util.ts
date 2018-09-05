import { readFileSync, statSync } from 'fs'
import { DefinitionNode, DocumentNode, parse } from 'graphql'
import * as R from 'ramda'

import { importSchema } from 'graphql-import'
import { typeSystemHashMap } from './hashmap'
import { GraphqlTypeEditor } from './TypeEditor'
import { Hash, SupportedDefinitionNode } from './types'

export const hashArrByName = <T extends SupportedDefinitionNode>(
  defs: ReadonlyArray<T>
) =>
  defs.reduce(
    (acc, def) => {
      acc[def.name.value] = def
      return acc
    },
    {} as Hash<T>
  )

export const unhashTypeDefinitions = (defs: Hash<GraphqlTypeEditor>) =>
  Object.values(defs).reduce(
    (acc, def) => {
      acc.push(def.node())
      return acc
    },
    [] as SupportedDefinitionNode[]
  )

export const isSupported = (node: DefinitionNode): node is SupportedDefinitionNode =>
  R.has(node.kind, typeSystemHashMap)

export const hasName = (name: string) => R.pathEq(['name', 'value'], name)

export interface GetSchemaInputOptions {
  inputName?: string
  useImport?: boolean
}

export type getSchemaInput = (
  input: string | DocumentNode,
  options?: GetSchemaInputOptions
) => DocumentNode

export const getSchemaInput: getSchemaInput = (
  input,
  { inputName, useImport } = {}
) => {
  if (typeof input === 'object' && input.kind === 'Document') {
    return input
  } else if (typeof input === 'string') {
    // catch block to contain statSync error
    let isFile: boolean = false
    try {
      if (statSync(input).isFile()) {
        isFile = true
      }
    } catch (err) {
      // noop - it simply means that input is not a (valid) filepath
    }

    if (isFile) {
      return useImport ? parse(importSchema(input)) : parse(readFileSync(input, 'utf-8'))
    } else {
      return parse(input)
    }
  } else {
    throw new Error(`Provided invalid input argument ${inputName && `to '${inputName}'`}`)
  }
}
