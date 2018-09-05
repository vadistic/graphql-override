import { importSchema } from 'graphql-import'

export const schema = importSchema(__dirname + '/schema.graphql')
export const overrides = importSchema(__dirname + '/overrides.graphql')
