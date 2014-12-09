var gulp = require('gulp');

var sass = require('gulp-sass');
var connect = require('gulp-connect');

var a=1,b=1,c=1;

gulp.task('sass', function()
{
 return gulp.src('scss/*.scss').pipe(sass()).pipe(gulp.dest('css'));
});

gulp.task('go', function()
{
 gulp.watch('scss/*.scss', ['sass']);
 connect.server({port: 8080, root: [__dirname]});
});

gulp.task('default', ['go']);
