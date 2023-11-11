let gulp = require('gulp')
let cleanCSS = require('gulp-clean-css')
let htmlmin = require('gulp-htmlmin')
let htmlclean = require('gulp-htmlclean');
let babel = require('gulp-babel') /* 转换为es2015 */
let uglify = require('gulp-uglify')

// 设置根目录
const root = './public'
const pattern = '**/*'

// 压缩html
gulp.task('minify-html', function() {
  return gulp
    // 匹配所有 .html结尾的文件
    .src(`${root}/${pattern}.html`)
    .pipe(htmlclean())
    .pipe(
      htmlmin({
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      })
    )
    .pipe(gulp.dest('./public'))
})

// 压缩css
gulp.task('minify-css', function() {
  return gulp
    // 匹配所有 .css结尾的文件
    .src(`${root}/${pattern}.css`)
    .pipe(
      cleanCSS({
        // clean-css hack: see clean-css/clean-css
        compatibility: '*',
        format: 'beautify',
        level: 2
      })
    )
    .pipe(gulp.dest('./public'))
})

gulp.task('minify-js', function() {
  return gulp
    // 匹配所有 .js结尾的文件
    .src(`${root}/${pattern}.js`)
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('./public'))
})

gulp.task('default', gulp.series('minify-html','minify-css','minify-js'))