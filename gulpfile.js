const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', function(){
    // node source
    gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist"));
});

gulp.task('watch', ['default'], function () {
    gulp.watch(["src/**/*.js"], ['default']);
});