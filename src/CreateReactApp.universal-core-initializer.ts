import { CoreInitializer } from '@universal-packages/core'
import { Logger } from '@universal-packages/logger'
import { SubProcess } from '@universal-packages/sub-process'

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

    core.developer.terminalPresenter.startProgressIncreaseSimulation(78, 90000)

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
      command: 'rm',
      args: ['-rf', `./tmp/${this.reactAppName}/.git`]
    })
    await this.currentSubProcess.run()
    this.currentSubProcess = core.developer.terminalPresenter.setSubProcess({
      command: 'rsync',
      args: ['-av', `./tmp/${this.reactAppName}`, `${this.sourceLocation}/react-apps/${this.reactAppName}`]
    })
    await this.currentSubProcess.run()

    if (this.stopping) return

    this.logger.log({ level: 'INFO', title: 'Finishing up...', message: 'Finishing up the create-react-app reconfiguration', category: 'REACT' }, LOG_CONFIGURATION)

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
