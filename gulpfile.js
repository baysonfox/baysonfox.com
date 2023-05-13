var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;

// 压缩js文件
gulp.task('minify-js', function() {
  return gulp.src(['./public/**/.js', '!./public/js/**/*min.js'])
  .pipe(uglify())
  .pipe(gulp.dest('./public'));
});
gulp.task('minify-generated-js', function() {
  return gulp.src(['./public/js/*.js', '!./public/js/*min.js'])
  .pipe(uglify())
  .pipe(gulp.dest('./public/js'));
});
// 默认任务 gulp 4.0 适用的方式
gulp.task('default', gulp.parallel('minify-js', 'minify-generated-js')
 //build the website
);

