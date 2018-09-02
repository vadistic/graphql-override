import { parse } from 'graphql'
import * as path from 'path'

import { graphQLOverride } from '../src/override'
import { overrides, schema } from './mock'

describe('override', () => {
  it('does not crash', () => {
    const typeDefs = graphQLOverride(schema, overrides)
  })
  it('returns valid type', () => {
    const typeDefs = graphQLOverride(schema, overrides)
    expect(typeDefs).toMatchObject({ kind: 'Document' })
  })
})
