import { readFileSync } from 'fs'
import { DocumentNode, parse, print, TypeDefinitionNode } from 'graphql'
import * as path from 'path'
import * as R from 'ramda'

import { GraphQlAstEditor } from './AstEditor'
import { TypeDefinition } from './TypeDefinition'
import { tuple } from './util'

interface OverrideSchema {
  schema?: string | DocumentNode
  overrides?: string
  overridesPath?: string
}

interface OverrideSchemaOptions {
  silent: true
}

const directiveTypes = tuple('add', 'update', 'replace', 'delete')

const hasDirectives = R.has('directives')

const hasOverrideDirectives = (nodeTypeDef: TypeDefinitionNode) =>
  nodeTypeDef.directives.some(dir => dir.name.value === 'update')

export const overrideSchema = (
  args: OverrideSchema,
  options?: OverrideSchemaOptions
) => {
  // importing "directives.graph" so parsing overrides to AST won't fail
  const directives = readFileSync(
    path.join(__dirname, 'directives.graphql'),
    'utf8'
  )

  const overrides = args.overrides || readFileSync(args.overridesPath, 'utf8')
  const schema = args.schema

  // AST node definitions from (naive) merge of direcitve and override schemas
  const overrideAstDef = parse(`${directives} \n ${overrides}`).definitions

  const newSchema = new GraphQlAstEditor(schema)

  const user = newSchema.getTypeTest('User').

  newSchema.deleteType('Post')

  newSchema.createType(overrideAstDef[5])

  newSchema.replaceType(overrideAstDef[4])

  // tslint:disable-next-line:no-console
  console.log(newSchema.print())

  return newSchema
}

/*
Functions on type directives
create => !typeExist ? addType : error
extend => typeExist ? forEachField ( fieldExist ? replaceField : createField ) : error
replace => typeExist ? replacetype : error
delete => typeExist ? deletetype : error

Functions on fields directives
create => !fieldExist ? write : error
replace => fieldExist ? replaceField : error
delete => fieldExist ? deleteField : error
 */
