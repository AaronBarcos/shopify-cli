// This is an autogenerated file. Don't edit this file manually.
export interface hydrogenenvpull {
  /**
   * Specifies the environment to perform the operation using its handle. Fetch the handle using the `env list` command.
   * 
   */
  '--env <value>'?: string

  /**
   * Specifies the environment to perform the operation using its Git branch name.
   * @environment SHOPIFY_HYDROGEN_ENVIRONMENT_BRANCH
   */
  '--env-branch <value>'?: string

  /**
   * The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.
   * @environment SHOPIFY_HYDROGEN_FLAG_PATH
   */
  '--path <value>'?: string

  /**
   * Overwrites the destination directory and files if they already exist.
   * @environment SHOPIFY_HYDROGEN_FLAG_FORCE
   */
  '-f, --force'?: ''
}
