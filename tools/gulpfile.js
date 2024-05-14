/* eslint-disable no-console */
const { getProjectPath, getConfig } = require('./utils/projectHelper');

const getBabelCommonConfig = require('./getBabelCommonConfig');
const merge2 = require('merge2');
const { execSync } = require('child_process');
const through2 = require('through2');
const webpack = require('webpack');
const babel = require('gulp-babel');
const argv = require('minimist')(process.argv.slice(2));
const { Octokit } = require('@octokit/rest');

// const getNpm = require('./getNpm')
// const selfPackage = require('../package.json')
const chalk = require('chalk');
const getNpmArgs = require('./utils/get-npm-args');
const getChangelog = require('./utils/getChangelog');
const path = require('path');
// const watch = require('gulp-watch')
const ts = require('gulp-typescript');
const gulp = require('gulp');
const fs = require('fs');
const rimraf = require('rimraf');
const stripCode = require('gulp-strip-code');
const compareVersions = require('compare-versions');
const getTSCommonConfig = require('./getTSCommonConfig');
const replaceLib = require('./replaceLib');
// const sortApiTable = require('./sortApiTable');
const { glob } = require('glob');

const packageJson = require(getProjectPath('package.json'));
const tsDefaultReporter = ts.reporter.defaultReporter();
const cwd = process.cwd();
const libDir = getProjectPath('lib');
const esDir = getProjectPath('es');

const tsConfig = getTSCommonConfig();

// FIXME: hard code, not find typescript can modify the path resolution


function dist(done) {
  rimraf.sync(path.join(cwd, 'dist'));
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(getProjectPath('webpack.build.conf.js'));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();
    const { dist: { finalize } = {}, bail } = getConfig();

    if (stats.hasErrors()) {
      (info.errors || []).forEach(error => {
        console.error(error);
      });
      // https://github.com/ant-design/ant-design/pull/31662
      if (bail) {
        process.exit(1);
      }
    }
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);
    // Additional process of dist finalize
    if (finalize) {
      console.log('[Dist] Finalization...');
      finalize();
    }
    done(0);
  });
}
// 定义需要转化的文件
const tsFiles = ['**/*.ts', 'types/**/*.d.ts'];


gulp.task('clean', () => {
  rimraf.sync(getProjectPath('_site'));
  rimraf.sync(getProjectPath('_data'));
});

function babelify(js, modules) {
  const babelConfig = getBabelCommonConfig(modules);
  babelConfig.babelrc = false;
  delete babelConfig.cacheDirectory;
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  }
  const stream = js.pipe(babel(babelConfig)).pipe(
    through2.obj(function z(file, encoding, next) {
      this.push(file.clone());
      if (modules !== false) {
        const content = file.contents.toString(encoding);
        this.push(file);
      }
      next();
    }),
  );
  return stream.pipe(gulp.dest(modules === false ? esDir : libDir));
}

function compile(modules) {
  const { compile: { transformTSFile, transformFile } = {} } = getConfig();
  rimraf.sync(modules !== false ? libDir : esDir);

  
  let error = 0;

  // =============================== FILE ===============================
  let transformFileStream;

  // ================================ TS ================================
  const source = [
    'components/**/*.js',
    'components/**/*.jsx',
    'components/**/*.tsx',
    'components/**/*.ts',
    'types/**/*.d.ts',
    '!components/*/__tests__/*',
  ];

  // Strip content if needed
  let sourceStream = gulp.src(source);
  if (modules === false) {
    sourceStream = sourceStream.pipe(
      stripCode({
        start_comment: '@remove-on-es-build-begin',
        end_comment: '@remove-on-es-build-end',
      }),
    );
  }

  if (transformTSFile) {
    sourceStream = sourceStream.pipe(
      through2.obj(function (file, encoding, next) {
        let nextFile = transformTSFile(file) || file;
        nextFile = Array.isArray(nextFile) ? nextFile : [nextFile];
        nextFile.forEach(f => this.push(f));
        next();
      }),
    );
  }

  const tsResult = sourceStream.pipe(
    ts(tsConfig, {
      error(e) {
        tsDefaultReporter.error(e);
        error = 1;
      },
      finish: tsDefaultReporter.finish,
    }),
  );

  function check() {
    if (error && !argv['ignore-error']) {
      process.exit(1);
    }
  }

  tsResult.on('finish', check);
  tsResult.on('end', check);
  const tsFilesStream = babelify(tsResult.js, modules);
  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir));
  return merge2([tsFilesStream, tsd,  transformFileStream].filter(s => s));
}


const startTime = new Date();
gulp.task('compile-with-es', done => {
  console.log('start compile at ', startTime);
  console.log('[Parallel] Compile to es...');
  compile(false).on('finish', done);
});

gulp.task('compile-with-lib', done => {
  console.log('[Parallel] Compile to js...');
  compile().on('finish', () => {
    done();
  });
});

gulp.task('compile-finalize', done => {
  // Additional process of compile finalize
  const { compile: { finalize } = {} } = getConfig();
  if (finalize) {
    console.log('[Compile] Finalization...');
    finalize();
  }
  done();
});

gulp.task(
  'compile',
  gulp.series(gulp.parallel('compile-with-es', 'compile-with-lib'), 'compile-finalize', done => {
    console.log('end compile at ', new Date());
    console.log('compile time ', (new Date() - startTime) / 1000, 's');
    done();
  }),
);

gulp.task(
  'dist',
  gulp.series(done => {
    dist(done);
  }),
);



