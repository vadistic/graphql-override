import { parse } from 'graphql'
import * as prettier from 'prettier'

import { SupportedDefinitionNode } from '../src/types'

export const pretty = (source: string) => prettier.format(source, { parser: 'graphql' })

export const serialize = (obj: object) => JSON.stringify(obj, null, 2)

export const getDef = (source: string) =>
  parse(source).definitions[0] as SupportedDefinitionNode
