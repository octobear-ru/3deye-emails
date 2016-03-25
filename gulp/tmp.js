let $, addMediaQueries, args, browserSync, filename, files, gulp, handleError, keys, options, parallelize, paths, pngcrush, publisher, reload, runSequence, send, upload;

gulp = require("gulp");

$ = require('gulp-load-plugins')();

pngcrush = require('imagemin-pngcrush');

send = require("./mailer");

keys = require("./config/keys.coffee");

addMediaQueries = require("./addMediaQueries");

runSequence = require('run-sequence');

args = require('yargs').argv;

browserSync = require('browser-sync');

reload = browserSync.reload;

parallelize = require('concurrent-transform');

options = {};

options = {
  parallelize: {
    threads: 10
  },
  sass: {
    errLogToConsole: true,
    sourceComments: 'normal',
    outputStyle: 'compact'
  }
};

paths = {
  jade: "./jade/**/*.jade",
  jadeTemplates: "./jade/templates/*.jade",
  html: "./*.html",
  stylus: "styles/**/*.styl",
  stylusIndex: ["./styles/styles.styl", "./styles/_fonts.styl"],
  css: "styles/css/",
  images: "images/*",
  build: "./build",
  dist: "./dist",
  s3images: "images/"
};

publisher = $.awspublish.create({
  region: keys.s3.region,
  params: {
    Bucket: keys.s3.bucket
  },
  accessKeyId: keys.s3.key,
  secretAccessKey: keys.s3.secret
});

handleError = () => $.plumber({
  errorHandler: $.notify.onError(() => {
    $.util.beep();
    return "Error: <%= error.message %>";
  })
});

gulp.task("inline", () => gulp.src(paths.html).pipe($.inlineCss({
  preserveMediaQueries: true
})).pipe(gulp.dest(paths.build)));

gulp.task("plaintext", () => {
  gulp.src(paths.html).pipe($.html2txt()).pipe(gulp.dest(`${paths.build}/plaintext`));
});

gulp.task('browser-sync', () => {
  browserSync({
    proxy: 'localhost:8080'
  });
});

gulp.task(
  "stylus",
  () => gulp.src(paths.stylusIndex).pipe(handleError()).pipe($.stylus()).pipe($.autoprefixer()).pipe($.combineMediaQueries()).pipe(gulp.dest(paths.css)).pipe($.livereload()).pipe(reload({
    stream: true
  }))
);

gulp.task(
  "stylus:build",
  () => gulp.src(paths.stylusIndex).pipe($.stylus()).pipe($.autoprefixer()).pipe($.combineMediaQueries()).pipe(gulp.dest(paths.css))
);

gulp.task(
  "sass",
  () => gulp.src(paths.sassIndex).pipe(handleError()).pipe($.sass(options.sass)).pipe($.autoprefixer()).pipe($.combineMediaQueries()).pipe(gulp.dest(path.cs)).pipe($.livereload()).pipe(reload({
    stream: true
  }))
);

gulp.task(
  'sourcemaps-inline',
  () => gulp.src(paths.stylusIndex).pipe($.sourcemaps.init()).pipe($.stylus()).pipe($.sourcemaps.write()).pipe(gulp.dest(paths.css))
);

gulp.task(
  'sourcemaps-external',
  () => gulp.src(paths.stylusIndex).pipe($.sourcemaps.init()).pipe($.stylus()).pipe($.sourcemaps.write('.')).pipe(gulp.dest(paths.css))
);

gulp.task(
  "jade",
  () => gulp.src(paths.jadeTemplates).pipe(handleError()).pipe($.jade({
    pretty: true
  })).pipe(gulp.dest('./')).pipe($.livereload()).pipe(reload({
    stream: true
  }))
);

gulp.task("jade:build", () => gulp.src(paths.jadeTemplates).pipe($.jade({
  pretty: true
})).pipe(gulp.dest('./')));

gulp.task("clean:dist", () => gulp.src(paths.dist).pipe($.clean()));

gulp.task(
  "html2hbs",
  ["clean:dist"],
  () => gulp.src(`${paths.build}/*.html`).pipe($.rename({
    extname: ".hbs"
  })).pipe(gulp.dest(paths.dist))
);

upload = publisher => gulp.src(`${paths.s3images}/**/*`).pipe(parallelize(publisher.publish(), options.parallelize.threads)).pipe(publisher.cache()).on('error', function(err) {
  $.util.log($.util.colors.red('s3 upload error:'), '\n', err, '\n');
  return this.emit('end');
}).pipe($.awspublish.reporter());

gulp.task('s3', () => upload(publisher));

gulp.task("connect", () => $.connect.server({
  root: __dirname
}));

gulp.task("reload", () => {
  gulp.src(paths.html).pipe($.livereload());
});

gulp.task("browser-sync-reload", () => {
  gulp.src(paths.html).pipe(reload({
    stream: true
  }));
});

gulp.task("watch", () => {
  let server;
  server = $.livereload();
  $.livereload.listen();
  gulp.watch(paths.stylus, ["stylus", "sourcemaps-external"]);
  gulp.watch(paths.jade, ["jade"]);
  gulp.watch(
    [paths.html, paths.css],
    ["reload", "browser-sync-reload", "build", "sourcemaps-external"]
  );
});

gulp.task("clean", require("del").bind(null, [paths.build]));

gulp.task("build", () => runSequence(["inline", "addMediaQueries"]));

gulp.task("dist", () => runSequence(["build", "html2hbs"]));

files = ["index.html"];

filename = args.file;

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

gulp.task("addMediaQueries", () => addMediaQueries(files));

gulp.task("default", ["connect", "watch", "browser-sync"]);

