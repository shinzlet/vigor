const gulp = require('gulp')
    , sass = require('gulp-sass');

gulp.task('default', () => {
    return gulp
        .src('public/css/style.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', () => {
    gulp.watch('public/css/*.scss', gulp.series('default'));
});
