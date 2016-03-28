'use strict';
//import path from 'path';
//import gulpLoadPlugins from 'gulp-load-plugins';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;

  gulp.task("inlineCss", () => {
    gulp.src(preview + '/*.html')
      .pipe(plugins.inlineCss({
        preserveMediaQueries: true,
        applyStyleTags: true,
        applyLinkTags: true,
        removeStyleTags: false,
        removeLinkTags: true
      }))
      .pipe(gulp.dest(build));
  });
}
