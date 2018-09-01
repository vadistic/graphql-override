import { parse } from 'graphql'
import * as prettier from 'prettier'

import { GraphqlDefinitionEditor } from '../src'
import { SupportedDefinitionNode } from '../src/types'

const pretty = (source: string) => prettier.format(source, { parser: 'graphql' })

const serialize = (obj: object) => JSON.stringify(obj, null, 2)

const getDef = (source: string) => parse(source).definitions[0] as SupportedDefinitionNode

describe('DefinitionEditor SupportedNodeTypes', () => {
  it('parse & print ScalarTypeDefinition', () => {
    const source = pretty(`
    scalar Date
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('ScalarTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node of ObjectTypeDefinition', () => {
    const source = pretty(`
    type Query {
      Tweet(id: ID!): Tweet
      Tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
    }
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('ObjectTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node of InterfaceTypeDefinition', () => {
    const source = pretty(`
    interface BssicNode {
      id: ID!
      createdAt: DateTime!
      deletedAt: DateTime
    }
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('InterfaceTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node of UnionTypeDefinition', () => {
    const source = pretty(`
    union Person = User | Candidate
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('UnionTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse & print & returns node of EnumTypeDefinition', () => {
    const source = pretty(`
    enum OrderBy {
      name
      age
      last_login
    }
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('EnumTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node of InputObjectTypeDefinition', () => {
    const source = pretty(`
    input CreateTweetInput {
      body: String
      tags: [String]!
    }
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('InputObjectTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node of DirectiveDefinition', () => {
    const source = pretty(`
    directive @deprecated(
      reason: String = "No longer supported"
    ) on FIELD_DEFINITION | ENUM_VALUE
    `)

    const editor = new GraphqlDefinitionEditor(getDef(source))

    expect(editor.kind()).toMatch('DirectiveDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })
})
