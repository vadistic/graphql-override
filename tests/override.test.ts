import { GraphqlDocumentEditor } from '../src'
import { graphQLOverride } from '../src/override'
import { overrides, schema } from './fixtures'

describe('override (Basics)', () => {
  it('does not crash', () => {
    const typeDefs = graphQLOverride(schema, overrides)
  })

  it('returns valid type', () => {
    const typeDefs = graphQLOverride(schema, overrides)
    expect(typeDefs).toMatchObject({ kind: 'Document' })
  })

  it('throws error on type & field directive combination', () => {
    const _overrides = `
    type Post @create {
      id: ID! @delete
      username: String
    }
    `
    expect(() => {
      graphQLOverride(schema, _overrides)
    }).toThrowError('not supported')
  })
})

describe('override (Type Directives)', () => {
  it('@create succeeds', () => {
    const _overrides = `
    type Post @create {
      id: ID!
      username: String
    }
    `
    const typeDefs = graphQLOverride(schema, _overrides)

    expect(new GraphqlDocumentEditor(typeDefs).hasDefinition('User')).toBeTruthy()
  })

  it('@create fail', () => {
    const _overrides = `
    input createTweetInput @create {
      body: String!
      tags: [String]
    }
    `
    expect(() => {
      graphQLOverride(schema, _overrides)
    }).toThrowError('already exists')
  })

  it('@replace succeeds', () => {
    const _overrides = `
    type Stat @replace {
      views: Int
      likes: Int
      responses: Int
    }
    `
    const typeDefs = graphQLOverride(schema, _overrides)

    expect(new GraphqlDocumentEditor(typeDefs).hasDefinition('User')).toBeTruthy()
  })

  it('@create fail', () => {
    const _overrides = `
    input createTweetInput @create {
      body: String!
      tags: [String]
    }
    `
    expect(() => {
      graphQLOverride(schema, _overrides)
    }).toThrowError('already exists')
  })

  it('@remove succeeds', () => {
    const _overrides = `
    type User @remove {
      id: ID!
      username: String
    }
    `
    const typeDefs = graphQLOverride(schema, _overrides)

    expect(new GraphqlDocumentEditor(typeDefs).hasDefinition('User')).toBeFalsy()
  })

  it('@remove fails', () => {
    const _overrides = `
    type Userrrr @remove {
      id: ID!
      username: String
    }
    `
    expect(() => {
      graphQLOverride(schema, _overrides)
    }).toThrowError('does not exist')
  })
})
