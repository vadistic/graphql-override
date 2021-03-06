import { ObjectTypeDefinitionNode } from 'graphql'
import * as R from 'ramda'

import { GraphqlTypeEditor } from '../src'
import { getDef, pretty, serialize } from './util'

describe('TypeEditor (Basics)', () => {
  const schema = `
  interface BasicNode {
    id: ID!
    createdAt: DateTime!
    deletedAt: DateTime
  }`

  const editor = new GraphqlTypeEditor(getDef(schema))

  it('instantiate', () => {
    expect(editor).toBeInstanceOf(GraphqlTypeEditor)
  })

  it('.print() matches snapshot', () => {
    expect(editor.print()).toMatchSnapshot()
  })

  it('.print() matches source', () => {
    expect(pretty(editor.print())).toMatch(pretty(schema))
  })

  it('.node() matches snapschot', () => {
    const astNode = editor.node()
    expect(serialize(astNode)).toMatchSnapshot()
  })
})

describe('TypeEditor (SupportedDefinitionNode)', () => {
  // Types
  it('parse, print & returns node snapshot of ScalarTypeDefinition', () => {
    const source = pretty(`
    scalar Date
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('ScalarTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of ObjectTypeDefinition', () => {
    const source = pretty(`
    type Query {
      Tweet(id: ID!): Tweet
      Tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('ObjectTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of InterfaceTypeDefinition', () => {
    const source = pretty(`
    interface BasicNode {
      id: ID!
      createdAt: DateTime!
      deletedAt: DateTime
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('InterfaceTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of UnionTypeDefinition', () => {
    const source = pretty(`
    union Person = User | Candidate
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('UnionTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse & print & returns node snapshot of EnumTypeDefinition', () => {
    const source = pretty(`
    enum OrderBy {
      name
      age
      last_login
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('EnumTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of InputObjectTypeDefinition', () => {
    const source = pretty(`
    input CreateTweetInput {
      body: String
      tags: [String]!
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('InputObjectTypeDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  // TypeExtensions

  it('parse, print & returns node snapshot of ScalarTypeExtension', () => {
    const source = pretty(`
    extend scalar Date @some_directive
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('ScalarTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of ObjectTypeExtension', () => {
    const source = pretty(`
    extend type Query {
      Tweet(id: ID!): Tweet
      Tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('ObjectTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of InterfaceTypeExtension', () => {
    const source = pretty(`
    extend interface BasicNode {
      id: ID!
      createdAt: DateTime!
      deletedAt: DateTime
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('InterfaceTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of UnionTypeExtension', () => {
    const source = pretty(`
    extend union Person = User | Candidate
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('UnionTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse & print & returns node snapshot of EnumTypeExtension', () => {
    const source = pretty(`
    extend enum OrderBy {
      name
      age
      last_login
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('EnumTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of InputObjectTypeExtension', () => {
    const source = pretty(`
    extend input CreateTweetInput {
      body: String
      tags: [String]!
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('InputObjectTypeExtension')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('parse, print & returns node snapshot of DirectiveDefinition', () => {
    const source = pretty(`
    directive @deprecated(
      reason: String = "No longer supported"
    ) on FIELD_DEFINITION | ENUM_VALUE
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.kind()).toMatch('DirectiveDefinition')
    expect(pretty(editor.print())).toMatch(source)
    expect(serialize(editor.node())).toMatchSnapshot()
  })

  it('throw not supported error on OperationDefinition type', () => {
    const source = pretty(`
    query GetHero {
      hero {
        name
        appearsIn
      }
    }
    `)

    const def = getDef(source)

    expect(def.kind).toMatch('OperationDefinition')
    expect(() => {
      const editor = new GraphqlTypeEditor(getDef(source))
    }).toThrowError('not supported')
  })
})

describe('TypeEditor (CRUD)', () => {
  it('.hasProp() succeeds & fails', () => {
    const source = pretty(`
    input CreatePostInput {
      title: String!
      body: String!
      author: User!
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.hasProp('values')).toBeFalsy()
    expect(editor.hasProp('fields')).toBeTruthy()
  })

  it('.hasInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    interface BasicNode {
      id: ID!
      createdAt: DateTime!
      deletedAt: DateTime
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.hasInProp('fields')('id')).toBeTruthy()
    expect(editor.hasInProp('fields')('updatedAt')).toBeFalsy()
    expect(() => {
      editor.hasInProp('values')('createdAt')
    }).toThrowError('not exist')
  })

  it('.getInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    expect(editor.getInProp('fields')('id').name.value).toMatch('id')
    expect(editor.getInProp('fields')('deletedat')).toBeFalsy()

    expect(() => {
      editor.hasInProp('values')('id')
    }).toThrowError()
  })

  it('.createInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const fieldSource = pretty(`
    type Notification {
      newField: number! @hello
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    const validField = (getDef(fieldSource) as ObjectTypeDefinitionNode).fields[0]
    const invalidField = (getDef(source) as ObjectTypeDefinitionNode).fields[0]

    // creates new field
    expect(
      editor
        .createInProp('fields')(validField)
        .hasField('newField')
    ).toBeTruthy()
    expect(editor.getInProp('fields')('deletedat')).toBeFalsy()

    // trying to create field that already exist
    expect(() => {
      editor.createInProp('fields')(invalidField)
    }).toThrowError('Cannot create')

    // trying to create field on invalid prop
    expect(() => {
      editor.createInProp('values')(invalidField as any)
    }).toThrowError('Cannot create')
  })

  it('.upsertInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    const createfield = R.assocPath(
      ['name', 'value'],
      'variant',
      (getDef(source) as ObjectTypeDefinitionNode).fields[0]
    )

    const replaceField = R.assoc(
      'description',
      'Some cool description',
      (getDef(source) as ObjectTypeDefinitionNode).fields[0]
    )

    // creating new field
    expect(
      editor
        .upsertInProp('fields')(createfield)
        .hasField('variant')
    ).toBeTruthy()

    // replacing field
    expect(
      editor
        .upsertInProp('fields')(replaceField)
        .getField('id').description
    ).toMatch('Some cool description')

    // trying to create field on wrong prop
    expect(() => {
      editor.upsertInProp('values')(createfield as any)
    }).toThrowError('Cannot upsert')
  })

  it('.replaceInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    const validField = R.assoc(
      'description',
      'Some cool description',
      (getDef(source) as ObjectTypeDefinitionNode).fields[0]
    )

    const invalidField = R.assocPath(
      ['name', 'value'],
      'variant',
      (getDef(source) as ObjectTypeDefinitionNode).fields[0]
    )

    // replacing field
    expect(
      editor
        .replaceInProp('fields')(validField)
        .getField('id').description
    ).toMatch('Some cool description')

    // trying to replace field on wrong prop
    expect(() => {
      editor.replaceInProp('values')(validField as any)
    }).toThrowError('Cannot replace')

    // trying to replace field that does not exist
    expect(() => {
      editor.replaceInProp('fields')(invalidField as any)
    }).toThrowError('does not exist')
  })

  it('.deleteInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    // deletes field
    expect(
      editor
        .deleteInProp('fields')('date')
        .hasField('date')
    ).toBeFalsy()

    // trying to delete field on invalid prop
    expect(() => {
      editor
        .deleteInProp('values')('date')
        .hasField('date')
    }).toThrowError('Cannot delete')
  })

  it('.removeInProp() succeeds, fails & throw error', () => {
    const source = pretty(`
    type Notification {
      id: ID
      date: Date
      type: String
    }
    `)

    const editor = new GraphqlTypeEditor(getDef(source))

    // removes field
    expect(
      editor
        .removeInProp('fields')('date')
        .hasField('date')
    ).toBeFalsy()

    // trying to remove field on invalid prop
    expect(() => {
      editor
        .removeInProp('values')('date')
        .hasField('date')
    }).toThrowError('Cannot remove')

    // trying to remove non-existent field
    expect(() => {
      editor
        .removeInProp('fields')('user')
        .hasField('date')
    }).toThrowError('Cannot remove')
  })
})
