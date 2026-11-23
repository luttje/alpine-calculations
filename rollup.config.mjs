import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'builds/cdn.js',
  output: [
    {
      name: 'AlpineCalculations',
      file: 'dist/alpine-calculations.js',
      format: 'umd',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    })
  ]
}
