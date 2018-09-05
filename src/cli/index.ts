#!/usr/bin/env node
import * as meow from 'meow'

import { cli } from './cli'
export * from './cli'

export const main = meow(
  `
  Usage
  $ graphql-override <flags>

  Options
  --config, -c      path to .graphqlconfig (if not in root dir)
  --schema, -s      path to main schema
  --overrides, -r   path to overrides
  --output, -o      location for generated file (with filename and extension)

  Example with .graphqlconfig
  $ graphql-override

  Example without .graphql config (all flags required)
  $ graphql-override -s src/schema/schema.graphql -o src/schema/overrides.graphql -o src/generated/app.graphql

  <cool emoji>
  `,
  {
    flags: {
      config: {
        type: 'string',
        alias: 'c',
      },
      schema: {
        type: 'string',
        alias: 's',
      },
      overrides: {
        type: 'string',
        alias: 'r',
      },
      output: {
        type: 'string',
        alias: 'o',
      },
    },
  }
)

// run!
cli(main.flags)
