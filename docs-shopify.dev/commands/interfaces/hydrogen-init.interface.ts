// This is an autogenerated file. Don't edit this file manually.
export interface hydrogeninit {
  /**
   * Overwrites the destination directory and files if they already exist.
   * @environment SHOPIFY_HYDROGEN_FLAG_FORCE
   */
  '-f, --force'?: ''

  /**
   * The path to the directory of the new Hydrogen storefront.
   * @environment SHOPIFY_HYDROGEN_FLAG_PATH
   */
  '--path <value>'?: string

  /**
   * Sets the template language to use. One of `js` or `ts`.
   * @environment SHOPIFY_HYDROGEN_FLAG_LANGUAGE
   */
  '--language <value>'?: string

  /**
   * Scaffolds project based on an existing template or example from the Hydrogen repository.
   * @environment SHOPIFY_HYDROGEN_FLAG_TEMPLATE
   */
  '--template <value>'?: string

  /**
   * Auto installs dependencies using the active package manager.
   * @environment SHOPIFY_HYDROGEN_FLAG_INSTALL_DEPS
   */
  '--install-deps'?: ''

  /**
   * Use mock.shop as the data source for the storefront.
   * @environment SHOPIFY_HYDROGEN_FLAG_MOCK_DATA
   */
  '--mock-shop'?: ''

  /**
   * Sets the styling strategy to use. One of `tailwind`, `css-modules`, `vanilla-extract`, `postcss`, `none`.
   * @environment SHOPIFY_HYDROGEN_FLAG_STYLING
   */
  '--styling <value>'?: string

  /**
   * Sets the URL structure to support multiple markets. Must be one of: `subfolders`, `domains`, `subdomains`, `none`. Example: `--markets subfolders`.
   * @environment SHOPIFY_HYDROGEN_FLAG_I18N
   */
  '--markets <value>'?: string

  /**
   * Creates a global h2 shortcut for Shopify CLI using shell aliases. Deactivate with `--no-shortcut`.
   * @environment SHOPIFY_HYDROGEN_FLAG_SHORTCUT
   */
  '--shortcut'?: ''

  /**
   * Generate routes for all pages.
   * @environment SHOPIFY_HYDROGEN_FLAG_ROUTES
   */
  '--routes'?: ''

  /**
   * Init Git and create initial commits.
   * @environment SHOPIFY_HYDROGEN_FLAG_GIT
   */
  '--git'?: ''

  /**
   * Scaffolds a new Hydrogen project with a set of sensible defaults. Equivalent to `shopify hydrogen init --path hydrogen-quickstart --mock-shop --language js --shortcut --routes --markets none`
   * @environment SHOPIFY_HYDROGEN_FLAG_QUICKSTART
   */
  '--quickstart'?: ''
}
