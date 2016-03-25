'use strict';

import path from 'path';
import ghPages from 'gulp-gh-pages';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;

  gulp.task('ghPages', function() {
    return gulp.src([
      path.join(build, '**/*')
    ])
    .pipe(ghPages())
    .on('error', function(err) {
      plugins.util.log(
        plugins.util.colors.red('Github pages upload error:'),
        '\n',
        err,
        '\n'
      );
      this.emit('end');
    });
  });

}
