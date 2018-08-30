import { importSchema } from 'graphql-import'
import { overrideSchema } from '../src'

const schema = importSchema(__dirname + '/schema.graphql')

const newSchema = overrideSchema({schema, overridesPath: __dirname + '/overrides.graphql'})
