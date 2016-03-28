'use strict';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;

  gulp.task("plaintext", () => {
    gulp.src(preview)
      .pipe(plugins.html2txt())
      .pipe(gulp.dest(`${build}/plaintext`));
  });

}
