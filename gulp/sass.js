'use strict';

import path from 'path';
import autoprefixer from 'autoprefixer';
import gulpif from 'gulp-if';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let entries = config.entries;
  let dest = path.join(taskTarget, dirs.styles.replace(/^_/, ''));
  let preview = path.join(dirs.preview, dirs.styles.replace(/^_/, ''));

  // Sass compilation
  gulp.task('sass', () => {
  });

  gulp.task('sass:preview', () => {
    execSass('preview');
  });

  gulp.task('sass', () => {
    execSass();
  });

  let execSass = function(target) {
    let destTarget;
    if (target && target === 'preview') {
      destTarget = preview;
    } else {
      destTarget = dest;
    }
    gulp.src(path.join(dirs.source, dirs.styles, entries.css))
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: [
        path.join(dirs.source, dirs.styles),
        path.join(dirs.source, dirs.modules)
      ]
    }).on('error', plugins.sass.logError))
    .pipe(plugins.postcss([autoprefixer({browsers: ['last 2 version', '> 5%', 'safari 5', 'ios 6', 'android 4']})]))
    .pipe(plugins.rename(function(path) {
      // Remove 'source' directory as well as prefixed folder underscores
      // Ex: 'src/_styles' --> '/styles'
      path.dirname = path.dirname.replace(dirs.source, '').replace('_', '');
    }))
    .pipe(gulpif(args.production, plugins.minifyCss({rebase: false})))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(destTarget))
    .pipe(browserSync.stream({match: '**/*.css'}));
  }
}
