import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import commonjs from '@rollup/plugin-commonjs';

const { name, version, license, author, homepage } = require('./package.json');

const banner = `/*! ${name} v${version} | ${license} (c) ${new Date().getFullYear()} ${author.name}, (c) 2021 Chris Diana | ${homepage} */`;

const outputs = [];

outputs.push({
  file: 'dist/cms.js',
  name: 'CMS',
  format: 'iife',
  banner: banner,
});
outputs.push({
  file: 'dist/cms.es.js',
  name: 'CMS',
  format: 'es',
  banner: banner,
});

export default {
    input: 'src/main.js',
		external: ['CMS'],
    output: outputs,
    plugins: [
      eslint(),
      resolve(),
			commonjs(),
      babel({ exclude: 'node_modules/**' }),
    ],
};
