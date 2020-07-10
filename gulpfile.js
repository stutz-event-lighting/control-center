var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var watch = require("gulp-watch");
var watchify = require("watchify");
var browserify = require("browserify");
var replaceExt = require("gulp-ext-replace");
var transform = require("gulp-transform");
var jade2react = require("jade2react");
var babel = require("gulp-babel");
var cp = require("child_process");

function buildJade(w) {
  return (w
    ? watch("src/**/*.jade", { ignoreInitial: true })
    : gulp.src("src/**/*.jade")
  )
    .pipe(replaceExt(".js"))
    .pipe(transform((code) => jade2react.compile(code.toString("utf8"))))
    .pipe(
      babel({
        presets: ["es2015"],
        plugins: ["syntax-async-functions", "transform-regenerator"],
      })
    )
    .pipe(gulp.dest("lib"));
}

function buildJs(w) {
  return (w
    ? watch("src/**/*.js", { ignoreInitial: true })
    : gulp.src("src/**/*.js")
  )
    .pipe(
      babel({
        presets: ["es2015"],
        plugins: ["syntax-async-functions", "transform-regenerator"],
      })
    )
    .pipe(gulp.dest("lib"));
}

function bundle(w, cb) {
  var bundle = browserify({
    cache: {},
    packageCache: {},
  });
  bundle.add(require.resolve("./lib/client/index.js"));
  if (w) bundle.plugin(watchify);

  function doBundle() {
    bundle.bundle(function (err, bundle) {
      console.log("bundling complete!");
      if (err) return console.log("ERROR:", err.message, err.stack);
      fs.writeFileSync("./lib/build.js", bundle);
      cb();
    });
  }

  bundle.on("update", doBundle);
  doBundle();
}

var p = null;
function restart() {
  if (p) p.kill();
  p = cp.exec("node ./");
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
}

gulp.task("buildJs", function () {
  return buildJs(false);
});
gulp.task("watchJs", function () {
  return buildJs(true);
});
gulp.task("buildJade", function () {
  return buildJade(false);
});
gulp.task("watchJade", function () {
  return buildJade(true);
});
gulp.task("buildBundle", ["buildJade", "buildJs"], function (cb) {
  bundle(false, cb);
});
gulp.task("watchBundle", ["buildJade", "buildJs"], function (cb) {
  bundle(true, () => {
    restart();
    cb();
  });
});

gulp.task("build", ["buildBundle"]);
gulp.task("watch", ["watchBundle", "watchJs", "watchJade"]);
