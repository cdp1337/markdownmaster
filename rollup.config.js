import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} (c) ${new Date().getFullYear()} ${pkg.author.name}, (c) 2021 Chris Diana | ${pkg.homepage} */`;
export default [
  {
    input: 'src/main.js',
    external: ['CMS'],
    output: [
      {
        file: 'dist/cms.js',
        name: 'CMS',
        format: 'iife',
        banner: banner,
      },
      {
        file: 'examples/js/cms.js',
        name: 'CMS',
        format: 'iife',
        banner: banner,
      },
      {
        file: 'dist/cms.es.js',
        name: 'CMS',
        format: 'es',
        banner: banner,
      }
    ],
    plugins: [
      eslint(),
      resolve(),
      //commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled'
      }),
    ],
  }
];