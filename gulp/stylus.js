'use strict';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;
  let styles = dirs.styles;

  gulp.task(
    "stylus",
    () => gulp.src(styles).pipe(handleError()).pipe($.stylus()).pipe($.autoprefixer()).pipe($.combineMediaQueries()).pipe(gulp.dest(paths.css)).pipe($.livereload()).pipe(reload({
      stream: true
    }))
  );

  gulp.task(
    "stylus:build",
    () => gulp.src(styles).pipe($.stylus()).pipe($.autoprefixer()).pipe($.combineMediaQueries()).pipe(gulp.dest(paths.css))
  );

}
