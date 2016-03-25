'use strict';

//import path from 'path';
//import gulpLoadPlugins from 'gulp-load-plugins';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;
  const threads = 10;
  let publishers = {};

  gulp.task("inline", () => gulp.src(preview).pipe($.inlineCss({
    preserveMediaQueries: true
  })).pipe(gulp.dest(build)));

  gulp.task("plaintext", () => {
    gulp.src(preview).pipe($.html2txt()).pipe(gulp.dest(`${build}/plaintext`));
  });

}
