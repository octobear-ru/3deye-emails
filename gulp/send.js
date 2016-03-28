'use strict';

import send from '../mailer'

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;
  let filename = args.file;

  gulp.task("send", () => send(filename));

  gulp.task("sendAll", () => {
    let file, i, results;
    i = 0;
    results = [];
    while (i < files.length) {
      file = files[i].split(".");
      send(file[0]);
      results.push(i++);
    }
    return results;
  });

}


