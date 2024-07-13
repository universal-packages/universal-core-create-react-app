import { CoreInitializer } from '@universal-packages/core'
import { Logger } from '@universal-packages/logger'
import { SubProcess } from '@universal-packages/sub-process'
import fs from 'fs'

import { DEFAULT_NAME } from './DEFAULT_NAME'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'

export default class CreateReactAppInitializer extends CoreInitializer {
  public static readonly initializerName = 'create-react-app'
  public static readonly description: string = 'Crate React App core initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  private readonly reactAppName: string
  private currentSubProcess: SubProcess
  private stopping = false

  constructor(args: any, logger: Logger) {
    super(args, logger)

    this.reactAppName = args.name || DEFAULT_NAME
    this.templateVariables.appsLocation = `${this.sourceLocation}/react-apps`
  }

  public async afterTemplatePopulate(): Promise<void> {
    core.developer.terminalPresenter.setProgressPercentage(20)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'mkdir', args: ['-p', 'tmp'] })
    await this.currentSubProcess.run()

    if (this.stopping) return

    core.developer.terminalPresenter.increaseProgressPercentageBy(2)

    this.logger.log(
      { level: 'INFO', title: 'Requesting create-react-app initialization', message: 'Executing npx create-react-app under the hood', category: 'REACT' },
      LOG_CONFIGURATION
    )

    core.developer.terminalPresenter.startProgressIncreaseSimulation(28, 90000)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'npx',
      args: ['create-react-app', this.reactAppName, ...(this.typescript ? ['--template', 'typescript'] : [])],
      workingDirectory: './tmp'
    })
    await this.currentSubProcess.run()

    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    if (this.stopping) return

    this.logger.log({ level: 'INFO', title: 'Reconfiguring...', message: 'Reconfiguring to work as a universal packages module', category: 'REACT' }, LOG_CONFIGURATION)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'mkdir', args: ['-p', `${this.sourceLocation}/react-apps/${this.reactAppName}`] })
    await this.currentSubProcess.run()

    if (this.stopping) return

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'rsync',
      args: ['-av', `./tmp/${this.reactAppName}/src`, `${this.sourceLocation}/react-apps/${this.reactAppName}`]
    })
    await this.currentSubProcess.run()
    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'rsync',
      args: ['-av', `./tmp/${this.reactAppName}/public`, `${this.sourceLocation}/react-apps/${this.reactAppName}`]
    })
    await this.currentSubProcess.run()

    if (this.stopping) return

    core.developer.terminalPresenter.startProgressIncreaseSimulation(40, 30000)

    const generatedReactAppPackageJson = JSON.parse(fs.readFileSync(`./tmp/${this.reactAppName}/package.json`, 'utf8'))

    this.logger.log(
      { level: 'INFO', title: 'Installing cra dependencies', message: 'Installing cra-dependencies into the universal core project', category: 'REACT' },
      LOG_CONFIGURATION
    )

    const developmentDependencies = Object.keys(generatedReactAppPackageJson.devDependencies || []).map(
      (dependency) => `${dependency}@${generatedReactAppPackageJson.devDependencies[dependency].replace('^', '')}`
    )

    Object.keys(generatedReactAppPackageJson.dependencies).forEach((dependency) => {
      if (dependency.includes('testing')) developmentDependencies.push(`${dependency}@${generatedReactAppPackageJson.dependencies[dependency].replace('^', '')}`)
    })

    const dependencies = Object.keys(generatedReactAppPackageJson.dependencies).map(
      (dependency) => `${dependency}@${generatedReactAppPackageJson.dependencies[dependency].replace('^', '')}`
    )

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'npm', args: ['install', '--save-dev', '--force', ...developmentDependencies] })
    await this.currentSubProcess.run()

    if (this.stopping) return

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'npm', args: ['install', '--save', '--force', ...dependencies] })
    await this.currentSubProcess.run()

    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    if (this.stopping) return

    this.logger.log({ level: 'INFO', title: 'Finishing up...', message: 'Finishing up the create-react-app reconfiguration', category: 'REACT' }, LOG_CONFIGURATION)

    fs.writeFileSync(
      `${this.sourceLocation}/react-apps/${this.reactAppName}/package.json`,
      JSON.stringify({ name: this.reactAppName, private: true, browserslist: generatedReactAppPackageJson.browserslist }, null, 2)
    )

    if (this.typescript) {
      this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
        command: 'cp',
        args: [`./tmp/${this.reactAppName}/tsconfig.json`, `${this.sourceLocation}/react-apps/${this.reactAppName}`]
      })
      await this.currentSubProcess.run()
    }

    core.developer.terminalPresenter.increaseProgressPercentageBy(5)

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'rm', args: ['-rf', `./tmp/${this.reactAppName}`] })
    await this.currentSubProcess.run()

    core.developer.terminalPresenter.setProgressPercentage(100)
  }

  public async abort(): Promise<void> {
    this.stopping = true

    if (this.currentSubProcess) await this.currentSubProcess.kill()
    core.developer.terminalPresenter.finishProgressIncreaseSimulation()

    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({ command: 'rm', args: ['-rf', `./tmp/${this.reactAppName}`] })
    await this.currentSubProcess.run()
  }
}
