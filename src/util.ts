import { readFileSync, statSync } from 'fs'
import { DefinitionNode, DocumentNode, parse } from 'graphql'
import * as R from 'ramda'

import { typeSystemHashMap } from './hashmap'
import { GraphqlTypeEditor } from './TypeEditor'
import { Hash, SupportedDefinitionNode } from './types'

export type Lit = string | number | boolean | undefined | null | void | {}
export const tuple = <T extends Lit[]>(...args: T) => args

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

export const validateSchemaInput = (input: string | DocumentNode, inputName?: string) => {
  if (typeof input === 'object' && input.kind === 'Document') {
    return input
  } else if (typeof input === 'string') {
    try {
      if (statSync(input).isFile()) {
        return parse(readFileSync(input, 'utf-8'))
      }
    } catch (err) {
      // noop - it just mean input is not a filepath
    }
    return parse(input)
  } else {
    throw new Error(`Provided invalid input argument ${inputName && `to '${inputName}'`}`)
  }
}
