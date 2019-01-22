import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { getGraphQLConfig } from 'graphql-config'
import * as meow from 'meow'
import * as path from 'path'
import * as R from 'ramda'

import { print } from 'graphql'
import { graphQLOverride } from '../override'

interface OverrideCliApi {
  config: string
  schema: never
  overrides: never
  output: never
}

export type OverrideCli = (args?: meow.Result['flags'] | Partial<OverrideCliApi>) => void

const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath)
  // I'm too lazy to handle errors of fs.statSync
  if (existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  mkdirSync(dirname)
  return true
}

const executeOverride = (task: Partial<OverrideCliApi>) => {
  const res = print(graphQLOverride(task.schema, task.overrides))
  ensureDirectoryExistence(task.output)
  writeFileSync(task.output, res)
  console.log(`graphql-override: new schema saved to: ${task.output}`)
}

export const cli: OverrideCli = args => {
  // run on cli flags if all are provided
  if (args.schema && args.overrides && args.output) {
    executeOverride(args)
  }
  // otherwise run on config
  else {
    // get config, optionally using config arg
    const { config } = args.config ? getGraphQLConfig(args.config) : getGraphQLConfig()
    // let's normalize multi & single project.graphqlconfig
    const projects = R.has('projects', config) ? R.values(config.projects) : [config]

    // execute for each task in each project that has override extension
    projects.forEach(project => {
      if (R.has('override', project.extensions)) {
        // override is an array and can contain mutiple jobs
        project.extensions.override.forEach(task => {
          // validate config data
          if (!(task.schema && task.overrides && task.output)) {
            throw new Error(
              `Invalid .graphqlconfig for override extension.` +
                `'schema', 'overrides' & 'output' fields must be provided for each task!`
            )
          }
          executeOverride(task)
        })
      }
    })
  }
}
