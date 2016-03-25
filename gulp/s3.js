'use strict';

import path from 'path';
import awspublish from 'gulp-awspublish';
import parallelize from 'concurrent-transform';
import keys from '../config/keys.js'

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;
  let build = dirs.destination;
  const threads = 10;
  let publishers = {};

  publishers.production = awspublish.create({
    region: keys.s3.production.region,
    params: {
      Bucket: keys.s3.production.bucket
    },
    accessKeyId: keys.s3.production.key,
    secretAccessKey: keys.s3.production.secret
  });

  publishers.staging = awspublish.create({
    region: keys.s3.staging.region,
    params: {
      Bucket: keys.s3.staging.bucket
    },
    accessKeyId: keys.s3.staging.key,
    secretAccessKey: keys.s3.staging.secret
  });

  let upload = function (publisher) {
    return gulp.src([
      path.join(build, '**/*')
    ])
    .pipe(parallelize(publisher.publish(), threads))
    // delete old files from the bucket
    //.pipe(publisher.sync())
    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())
    // print upload updates to console
    .on('error', function(err) {
      plugins.util.log(
        plugins.util.colors.red('s3 upload error:'),
        '\n',
        err,
        '\n'
      );
      this.emit('end');
    })
    .pipe(awspublish.reporter());
  }

  // Upload to s3 production
  gulp.task('s3:production', function () {
    upload(publishers.production);
  });

  // Upload to s3 staging
  gulp.task('s3:staging', function () {
    upload(publishers.staging);
  });

}
