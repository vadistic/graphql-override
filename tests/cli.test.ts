import { cli } from '../src/cli/cli'

describe('CLI', () => {
  it('single project .graphqlconfig', () => {
    cli({ config: 'tests/fixtures/single.graphqlconfig.yml' })
  })

  it('single project .graphqlconfig', () => {
    cli({ config: 'tests/fixtures/single.graphqlconfig.yml' })
  })

  it('multi project .graphqlconfig', () => {
    cli({ config: 'tests/fixtures/.graphqlconfig.yml' })
  })
})
