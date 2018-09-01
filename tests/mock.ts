import { importSchema } from 'graphql-import'
import { overrideSchema } from '../src'

export const schema = importSchema(__dirname + '/schema.graphql')
