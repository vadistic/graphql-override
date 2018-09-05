import { GraphqlDocumentEditor } from '../src'

import { parse, print } from 'graphql'

import { schema } from './fixtures'
import { serialize } from './util'

describe('TypeDefsEditor (Basics)', () => {
  const editor = new GraphqlDocumentEditor(schema)

  it('instantiate', () => {
    expect(editor).toBeInstanceOf(GraphqlDocumentEditor)
  })

  it('.print() matches snapshot', () => {
    expect(editor.print()).toMatchSnapshot()
  })

  it('.print() matches parse => print', () => {
    const editorPrint = editor.print()
    const parsePrint = print(parse(schema))

    expect(editorPrint).toMatch(parsePrint)
  })

  it('.node() matches snapschot', () => {
    const astNode = editor.node()
    expect(serialize(astNode)).toMatchSnapshot()
  })
})

describe('TypeDefsEditor (CRUD)', () => {
  const editor = new GraphqlDocumentEditor(schema)

  it('.hasDefinition() succeed', () => {
    const val = editor.hasDefinition('User')
    expect(val).toBeTruthy()
  })

  it('.hasDefinition() fails', () => {
    const val = editor.hasDefinition('Post')
    expect(val).toBeFalsy()
  })

  it('.getDefinition() succeed', () => {
    const definition = editor.getDefinition('Notification')
    expect(definition.print()).toMatchInlineSnapshot(`
"type Notification {
  id: ID
  date: Date
  type: String
}"
`)
  })

  it('.getDefinition() fails', () => {
    const definition = editor.getDefinition('Something')
    expect(definition).toBeFalsy()
  })
})
