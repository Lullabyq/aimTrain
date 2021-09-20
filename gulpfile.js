import gulp         from 'gulp'
import dartSass     from 'sass'
import gulpSass     from 'gulp-sass'
import concat       from 'gulp-concat'
import browserSync  from 'browser-sync'
import uglifyEs     from 'gulp-uglify-es'
import include      from 'gulp-file-include'
import autoprefixer from 'gulp-autoprefixer'
import htmlmin      from 'gulp-htmlmin'
import del          from 'del'

import imagemin , {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin'

const {src, dest, watch, series, parallel} = gulp
const scss   = gulpSass( dartSass )
const sync   = browserSync.create()
const uglify = uglifyEs.default


function browsersync() {
    sync.init({
        server: { baseDir: 'dist/'},
    })

    watch('src/**.html', series(html)).on('change', sync.reload)
    watch('src/scss/**.scss', series(css)).on('change', sync.reload)
    watch('src/js/**.js', series(scripts)).on('change', sync.reload)
}

function html() {
    return src('src/**.html')
    .pipe(include({
      prefix: '@@'
    }))
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(dest('dist'))
}

function css() {
    return src('src/scss/**.scss')
        .pipe(concat('style.scss'))
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(dest('dist/css'))
}

function scripts() {
    return src('src/js/index.js')
    .pipe(concat('index.min.js'))
    .pipe(uglify()) // compress js
    .pipe(dest('dist/js'))
}

export function images() {
    return src('src/imgs/**/*')
        .pipe(imagemin({verbose: true}))
        .pipe(dest('dist/imgs'))
}


function move() {
    return src([
        'app/fonts/**/*',
    ])
    .pipe(dest('dist/fonts'))
}

export const clear = () => del('dist/**')
export const build = series(clear, css, html, scripts, images, move)
export default series(clear, css, html, scripts, images, move, browsersync)