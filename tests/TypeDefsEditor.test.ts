import { GraphqlTypeDefsEditor } from '../src'

import { parse, print } from 'graphql'

import { schema } from './mock'

describe('TypeDefsEditor', () => {
  const editor = new GraphqlTypeDefsEditor(schema)

  it('instantiate', () => {
    expect(editor).toBeInstanceOf(GraphqlTypeDefsEditor)
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
    expect(JSON.stringify(astNode)).toMatchSnapshot()
  })

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
