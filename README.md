# graphql-override

> `graphql-override` – Utility tool for handy modification of GraphQL SDL Type Definitions. ✂️

## Overview

- Handy modification of Type Definitions in GraphQL SDL or AST (not executable schema nor executable definitions!)
- Allows to reuse generated schema definitions to forward resolvers and share SDL code between database and server API
- CLI & integration with `graphql-config`, `prisma` & `graphql-import`
- Transparent error reporting on unauthorized actions
- (Somehow limited, but still) GraphQL AST Editor for document & type nodes
- **very alpha** (it's just a small experiment - but frankly it would probably take just few hours to rewrite it yourself, so...)

## Override tool

### Install

```shell
$ yarn add -D graphql-override

or

$ npm install -D graphql-override
```

_(`graphql` is a peer dependency!)_

### Idea

So, the main idea is to use separate `overrides.graphql` file to modify Type Definitions and generate result file. Thanks to this - I can modify & reuse most of prisma-generated SDL without copying thousands of GraphQL SDL lines and struggling to keep all minor changes in sync.

I think, that sometimes it's easier to write diff (also leveraging proper error reporting) than having to re-declare most types in their entirety.

**([Full example](link))**

```gql
# overrides.graphql

# get override directives (to make schema valid)
# import * from '../../node_modules/graphql-override/dist/directives.graphql'

# or can just declare them anyhow - only it's name matter
# directive @create on FIELD_DEFINITION

# get all of your types (also to make schema valid)
# import * from "./schema.graphql"

# use override directives on type definition
type User @replace {
  id: ID!
  username: String
  first_name: String
  last_name: String
  full_name: String
  name: String
  avatar_url: Url
}

type Stat {
  # and on field definition
  views: Int @upsert
  likes: Int
  loves: Int @create
  retweets: Meta @replace
  responses: Int
}
```

```shell
$ graphql-override \
  --schema src/schema/schema.graphql \
  --overrides src/schema/overrides.graphql \
  --output src/generated/app.graphql

graphql-override: new schema saved to: src/generated/app.graphql
```

### Avalible CRUD+ (CRURDEE?) Directives

Directives can be apply to type or field definitions in overrides file. They perform specified action on schema and are removed from output.

> Currently, it's not allowed to mix type & field directives - override directive cannot be simuntaneusly applied to type definition and its field definition - only because all the combinatorics of the outcome would be hard to reason about (but it's possible to specify as many consecutive override tasks as you like in .graphqlconfig )

#### Directives for Type Definition or Field Definition

```gql
# Create Type|Field in schema (Error if node already exists)
directive @create on FIELD_DEFINITION

# Replace Type|Field (Error if node does not exists)
directive @replace on FIELD_DEFINITION

# Create or replace Type|Field (No errors 👌)
directive @upsert on FIELD_DEFINITION

# Remove Type|Field (Error if node is not found)
directive @remove on FIELD_DEFINITION

# Delete Type|Field (No errors, even if node is not found)
directive @delete on FIELD_DEFINITION
```

#### Directives ONLY for Type Definition

```gql
# Extend (merge) all fields, values, interfaces & directives  with type in schema
directive @extend on FIELD_DEFINITION

# Exclude (by name) all declared fields from type in schema
directive @exclude on FIELD_DEFINITION
```

### API usage

```ts
graphQLOverride = (
  schema: string | DocumentNode,
  overrides: string | DocumentNode,
  options?: GraphQLOverrideOptions
) => DocumentNode
```

### CLI tool

```
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
```

### Supported Types

This tool is meant to edit TypeDefs so it supports GraphqQL SDL - `TypeSystemDefinition` nodes (those, that are used to define schema). It does not support `ExecutableDefinition` (used to build queries client-side.)

```ts
type SupportedDefinitionNode =
  | TypeDefinitionNode
  | TypeExtensionNode
  | DirectiveDefinitionNode

// where
type TypeDefinitionNode =
  | ScalarTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode
  | InputObjectTypeDefinitionNode

type TypeExtensionNode =
  | ScalarTypeExtensionNode
  | ObjectTypeExtensionNode
  | InterfaceTypeExtensionNode
  | UnionTypeExtensionNode
  | EnumTypeExtensionNode
  | InputObjectTypeExtensionNode
```

(Support for `SchemaDefinitionNode` is in TODO)

```gql
# This is not supported :)

schema {
  query: Query
}
```

### Project set-up with `graphql-yoga`, `prisma` & `graphql-config`

**([Full example](link))**

```yml
# prisma.yml

hooks:
  post-deploy:
    - graphql get-schema --project database
    # post deploy hook to generate schema
    - graphql-override
```

```yml
# .graphqlconfig.yml

projects:
  # supports single & multi project config
  app:
    # generated schema is set as main schema (so codegen can generate correct types)
    schemaPath: src/generated/app.graphql
    extensions:
      endpoints:
        default: http://localhost:4000
      override:
        # override tasks are an yml array of obj (can be as many as you want)
        - schema: src/schema/schema.graphql
          overrides: src/schema/overrides.graphql
          output: src/generated/app.graphql
```

```ts
// index.ts
import { GraphQLServer } from 'graphql-yoga'
import { resolvers } from './resolvers'

// server is runing on generated typeDefs
const server = new GraphQLServer({ typeDefs: 'src/generated/app.graphql', resolvers })
server.start(() => console.log('Server is running on localhost:4000'))
```

## TypeEditor

All directives are executed by some an util called `DocumentEditor` (and subsequent `TypeEditor` for editing definition nodes). It's possible to use it to conviniently and edit schema without the whole **override stuff**. Typescript interfaces shows usage.

## TODO

- [ ] Add more tests
- [ ] Support `SchemaDefinitionNode`
- [ ] Opt-out from `graphql-import`
- [ ] @rename directive (?)
- [ ] Improve error reporting
- [ ] Finish docs & example
- [ ] **Evaluate if this tool makes any sense**
- [ ] Next project :)

## See also

- prisma
- graphql-tools
- graphql-compose
- graphql-import
- merge-graphql-schemas
