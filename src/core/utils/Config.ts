import * as vscode from 'vscode'

export class Config {
  private static instance: Config | null = null
  private packageJson: any
  private playgroundFolder: string
  private appendOutput: boolean
  private extensionId: string

  private constructor(context: vscode.ExtensionContext) {
    this.packageJson = context.extension.packageJSON
    this.extensionId = `${this.packageJson.publisher}.${this.packageJson.name}`

    this.loadConfig()

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('tinkerRunner')) {
        this.loadConfig()
      }
    })
  }

  /**
   * Initializes the Config class with context.
   * Must be called once in `activate()`.
   * @param context VSCode extension context
   */
  public static init(context: vscode.ExtensionContext): void {
    if (!this.instance) {
      this.instance = new Config(context)
    }
  }

  /**
   * Gets the singleton instance of Config.
   * Ensures `init()` has been called before access.
   * @returns Config instance
   */
  public static getInstance(): Config {
    if (!this.instance) {
      throw new Error(
        'Config has not been initialized. Call Config.init(context) first.',
      )
    }
    return this.instance
  }

  /**
   * Loads user configuration from `settings.json` (VS Code workspace settings).
   */
  private loadConfig() {
    const config = vscode.workspace.getConfiguration('tinkerRunner')
    this.playgroundFolder = config.get<string>(
      'playgroundFolder',
      'tinker-playground',
    )
    this.appendOutput = config.get<boolean>('appendOutput')
  }

  /**
   * Get a value from `package.json`.
   * @param key The key inside `package.json`.
   * @returns The value or `undefined` if not found.
   */
  public get<T>(key: string): T | undefined {
    const classPropertyValue = (this as any)[key]
    if (classPropertyValue) {
      return classPropertyValue
    }

    const keys = key.split('.') // Support for nested keys like "customConfig.someKey"
    let value: any = this.packageJson

    for (const k of keys) {
      if (value?.[k] !== undefined) {
        value = value[k]
      } else {
        return undefined // Return undefined if key is not found
      }
    }

    return value as T
  }
}
