var gulp = require("gulp");
var path = require("path");
var del = require("del");
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");
var shell = require("gulp-shell");
var reporters = require("jasmine-reporters");
var Reporter = require("jasmine-terminal-reporter");

gulp.task("install:typings", shell.task(["install:typings:src"]));
gulp.task("install:typings:src", shell.task("typings install"));

gulp.task("clean", function(cb) { return del("lib", cb); });
gulp.task("clean:typings", function (cb) { return del("src/typings", cb); });

gulp.task("compile", shell.task("tsc", {cwd: path.join(__dirname, "src")}));

gulp.task("lint-md", function(){
	return gulp.src(["**/*.md", "!node_modules/**/*.md"])
		.pipe(shell(["mdast <%= file.path %> --frail --no-stdout --quiet"]));
});

gulp.task("test", gulp.series("compile", function(cb) {
	var jasmineReporters = [ new Reporter({
			isVerbose: true,
			showColors: true,
			includeStackTrace: true
		}),
		new reporters.JUnitXmlReporter()
	];
	return gulp.src(["lib/**/*.js"])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src("spec/**/*[sS]pec.js")
				.pipe(jasmine({ reporter: jasmineReporters}))
				.pipe(istanbul.writeReports({ reporters: ["text", "cobertura", "lcov"] }))
				.on("end", cb);
		});
}));

gulp.task("default", gulp.series("compile"));
