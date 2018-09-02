import { GraphqlDocumentEditor } from '../src'
import { typeSystemHashMap } from '../src/hashmap'
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
  it('delete type', () => {
    const _overrides = `
    type User @delete {
      id: ID!
      username: String
    }
    `
    const typeDefs = graphQLOverride(schema, _overrides)

    expect(new GraphqlDocumentEditor(typeDefs).hasDefinition('User')).toBeFalsy()
  })
})
