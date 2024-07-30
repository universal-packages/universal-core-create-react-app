import { CoreApp } from '@universal-packages/core'
import { EmittedEvent } from '@universal-packages/event-emitter'
import { SubProcess } from '@universal-packages/sub-process'
import { constantCase } from 'change-case'
import fs from 'fs'

import { DEFAULT_NAME } from './DEFAULT_NAME'

export default class CreateReactApp extends CoreApp {
  public static readonly appName = 'create-react-app'
  public static readonly description = 'Create React App core app wrapper for development'
  public static readonly allowAppWatch = false
  public static readonly allowLoadModules = false
  public static readonly allowLoadEnvironments = false

  private reactScriptsSubProcess: SubProcess
  private existentReactApps: string[]
  private reactAppName: string

  async prepare() {
    this.existentReactApps = this.getDirectoryNamesFromPath(this.config.appsLocation)
    this.reactAppName = this.args.name || DEFAULT_NAME
  }

  public async run(): Promise<void> {
    if (!this.existentReactApps.includes(this.reactAppName)) {
      if (this.existentReactApps.length === 0) {
        throw new Error(`No apps found in ${this.config.appsLocation}`)
      } else {
        throw new Error(`The react app ${this.reactAppName} does not exist\n Available apps: ${this.existentReactApps.join(', ')}`)
      }
    }

    const reactAppEnvironmentVariables = Object.entries(this.config).reduce((acc, [key, value]) => {
      const variableName = constantCase(key)
      acc[variableName] = value

      return acc
    }, {})

    await core.developer.terminalPresenter.runSubProcess({
      command: 'npm',
      args: ['install'],
      workingDirectory: `${this.config.appsLocation}/${this.reactAppName}`
    })

    this.reactScriptsSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'npm',
      args: ['start'],
      env: reactAppEnvironmentVariables,
      workingDirectory: `${this.config.appsLocation}/${this.reactAppName}`
    })

    this.reactScriptsSubProcess.on('error', (event: EmittedEvent) => {
      if (this.reactScriptsSubProcess.status !== 'stopped') {
        this.logger.log({ level: 'ERROR', error: event.error })
      }
    })

    this.reactScriptsSubProcess.on('stdout', (event: EmittedEvent) => {
      const message = (event.payload.data || '').trim()
      const queryLines = ['Compiled successfully!', 'Compiling...', 'webpack compiled successfully']

      if (queryLines.some((queryLine) => message.includes(queryLine) && !message.includes('browser'))) {
        core.developer.terminalPresenter.setScriptOutput(message)
      } else {
        this.logger.log({ level: 'INFO', message })
      }
    })

    await this.reactScriptsSubProcess.run()
  }

  public async stop(): Promise<void> {
    await this.reactScriptsSubProcess.kill()
  }

  private getDirectoryNamesFromPath(path): string[] {
    return fs
      .readdirSync(path, {
        withFileTypes: true
      })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  }
}
