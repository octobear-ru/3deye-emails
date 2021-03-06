'use strict';

import fs from 'fs';
import path from 'path';
import foldero from 'foldero';
import jade from 'jade';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let dest = path.join(taskTarget);
  let dataPath = path.join(dirs.source, dirs.data);
  let preview = dirs.preview;

  // Jade template compile
  gulp.task('jade:preview', () => {
    execJade('preview');
  });

  gulp.task('jade', () => {
    execJade();
  });

  let execJade = function(target) {
    let destTarget;
    if (target && target === 'preview') {
      destTarget = preview;
    } else {
      destTarget = dest;
    }

    let siteData = {};
    if (fs.existsSync(dataPath)) {
      // Convert directory to JS Object
      siteData = foldero(dataPath, {
        recurse: true,
        whitelist: '(.*/)*.+\.(json)$',
        loader: function loadAsString(file) {
          let json = {};
          try {
            json = JSON.parse(fs.readFileSync(file, 'utf8'));
          }
          catch(e) {
            console.log('Error Parsing JSON file: ' + file);
            console.log('==== Details Below ====');
            console.log(e);
          }
          return json;
        }
      });
    }

    // Add --debug option to your gulp task to view
    // what data is being loaded into your templates
    if (args.debug) {
      console.log('==== DEBUG: site.data being injected to templates ====');
      console.log(siteData);
      console.log('\n==== DEBUG: package.json config being injected to templates ====');
      console.log(config);
    }

    return gulp.src([
      path.join(dirs.source, '**/*.jade'),
      '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}')
    ])
    .pipe(plugins.changed(dest))
    .pipe(plugins.plumber())
    .pipe(plugins.jade({
      jade: jade,
      pretty: true,
      locals: {
        config: config,
        debug: true,
        ghPagesUrl: config.ghPagesUrl,
        site: {
          data: siteData
        }
      }
    }))
    .pipe(plugins.htmlmin({
      collapseBooleanAttributes: true,
      conservativeCollapse: true,
      removeCommentsFromCDATA: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    }))
    .pipe(gulp.dest(destTarget))
    .on('end', browserSync.reload);

  }
}
