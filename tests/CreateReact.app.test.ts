import { SubProcess } from '@universal-packages/sub-process'

import CreateReactApp from '../src/CreateReact.universal-core-app'

coreJest.runApp('create-react-app', {
  coreConfigOverride: {
    config: { location: './tests/__fixtures__/config' },
    apps: { location: './tests/__fixtures__' },
    logger: { silence: true }
  }
})

describe(CreateReactApp, (): void => {
  it('behaves as expected', async (): Promise<void> => {
    expect(SubProcess).toHaveRun({
      command: 'npm',
      args: ['install'],
      workingDirectory: './tests/__fixtures__/react-apps/front-end-app'
    })
    expect(SubProcess).toHaveRun({
      command: 'npm',
      args: ['start'],
      workingDirectory: './tests/__fixtures__/react-apps/front-end-app',
      env: { APPS_LOCATION: './tests/__fixtures__/react-apps', HOST: 'localhost', PORT: 7575 }
    })
  })
})
