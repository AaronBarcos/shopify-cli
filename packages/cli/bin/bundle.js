/* eslint-disable @shopify/cli/specific-imports-in-bootstrap-code */
/* eslint-disable import/no-extraneous-dependencies */
import ShopifyStacktraceyPlugin from '../../../bin/bundling/esbuild-plugin-stacktracey.js'
import ShopifyVSCodePlugin from '../../../bin/bundling/esbuild-plugin-vscode.js'
import GraphiQLImportsPlugin from '../../../bin/bundling/esbuild-plugin-graphiql-imports.js'
import {build as esBuild} from 'esbuild'
import {copy} from 'esbuild-plugin-copy'
import glob from 'fast-glob'
import {joinPath, dirname} from '@shopify/cli-kit/node/path'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)

const external = [
  // react-devtools-core is a dev dependency, no need to bundle it but throws errors if not included here.
  'react-devtools-core',
  // esbuild can't be bundled per design
  'esbuild',
  'lightningcss',
  // These two are binary dependencies from Hydrogen that can't be bundled
  '@ast-grep/napi',
  '@parcel/watcher',
]

const generateSourcemaps = true

// yoga wasm file is not bundled by esbuild, so we need to copy it manually
const yogafile = glob.sync('../../node_modules/.pnpm/**/yoga.wasm')[0]

// Find theme-check-node's config yml files
const themePath = require.resolve('@shopify/theme-check-node')
const configYmlPath = joinPath(themePath, '..', '..', 'configs/*.yml')

const themeUpdaterPath = require.resolve('@shopify/theme-check-docs-updater')
const themeUpdaterDataPath = joinPath(themeUpdaterPath, '..', '..', 'data/*')

const hydrogenPath = dirname(require.resolve('@shopify/cli-hydrogen/package.json'))
const hydrogenAssets = joinPath(hydrogenPath, 'dist/assets/hydrogen/**/*')

esBuild({
  bundle: true,
  entryPoints: ['./src/**/*.ts'],
  outdir: './dist',
  platform: 'node',
  format: 'esm',
  define: {
    // Necessary for theme-check-node to work
    'process.env.WEBPACK_MODE': 'true',
  },
  inject: ['../../bin/bundling/cjs-shims.js'],
  external,
  sourcemap: generateSourcemaps,
  loader: {'.node': 'copy'},
  splitting: true,
  plugins: [
    ShopifyVSCodePlugin,
    GraphiQLImportsPlugin,
    ShopifyStacktraceyPlugin,
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: 'cwd',
      globbyOptions: {dot: true},
      assets: [
        {
          from: ['../app/assets/**/*'],
          to: ['./dist/assets'],
        },
        {
          from: ['../app/templates/**/*'],
          to: ['./dist/templates'],
        },
        {
          from: ['./assets/*'],
          to: ['./dist/assets'],
        },
        {
          from: ['../cli-kit/assets/**/*'],
          to: ['./dist/assets'],
        },
        {
          from: [yogafile],
          to: ['./dist/'],
        },
        {
          from: [configYmlPath],
          to: ['./dist/configs/'],
        },
        {
          from: [themeUpdaterDataPath],
          to: ['./dist/data/'],
        },
        {
          from: [hydrogenAssets],
          to: ['./dist/assets/hydrogen'],
        },
      ],
    }),
  ],
})
