const gulp = require('gulp')
const mocha = require('gulp-mocha')

gulp.task('test', function() {
   return gulp.src(['test/**/*.js']).pipe(mocha({exit:true}))
})

gulp.task('default', function() {
   return gulp.watch(['src/**/*.js','test/**/*.js'], ['test'])
})
