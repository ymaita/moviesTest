'use strict';

import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import cleanCss from 'gulp-clean-css';
import buffer from 'vinyl-buffer';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import styleInject from 'gulp-inject';
import concat from 'gulp-concat';
import shell from 'gulp-shell';

// Nombres de rutas
let pathsName = {
    source: {
        css: 'front/css/**/*.scss',
        js: 'front/js/**/*.js',
        indexJs: 'front/js/index.js',
        templates: 'front/templates/**/*.html',
        images: 'front/assets/images/**/*',
        assets: 'front/assets/**/*',
        gulpFile: 'gulpfile.js',
        testJsFiles: 'front/js/**/*.test.js'
    },
    dest: {
        root: 'build/',
        css: 'build/css/',
        cssFiles: 'styles.css',
        js: 'build/js/',
        jsFiles: 'scripts.js',
        fonts: 'build/fonts',
        images: 'build/images',
        templates: 'build/templates',
        assets: 'build/assets'
    }
};

/**
 * Copiar las plantillas HTML al directorio del build
 */
gulp.task('htmlNestoriaRealEstate', () => {
    return gulp.src(pathsName.source.templates)
        .pipe(gulp.dest(pathsName.dest.templates));
});

/**
 * Copiar las imagenes al directorio del build
 */
gulp.task('assetsNestoriaRealEstate', () => {
    return gulp.src(pathsName.source.assets)
        .pipe(gulp.dest(pathsName.dest.assets));
});

/**
 * Inyectar contenido CSS + JS a las plantillas HTML
 */
gulp.task('cssJsInjectNestoriaRealEstate', () => {
    let sources = gulp.src([pathsName.dest.css + pathsName.dest.cssFiles, pathsName.dest.js + pathsName.dest.jsFiles]);
    return gulp.src(`${pathsName.dest.root}/**/*.html`)
        .pipe(styleInject(sources, {relative: true}))
        .pipe(gulp.dest(pathsName.dest.root));
});

/**
 * Transpilar estilos SCSS a CSS
 */
gulp.task('sassNestoriaRealEstate', () => {
    return gulp.src(pathsName.source.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat(pathsName.dest.cssFiles))
        .pipe(cleanCss())
        .pipe(gulp.dest(pathsName.dest.css));
});

/**
 * Ejecutar module bundling y transpilar a ES5
 * Generando un unico .js
 */
gulp.task('jsNestoriaRealEstate', () => {
    let browserifyObj = browserify({
        entries: pathsName.source.indexJs,
        debug: true,
        transform: [babelify]
    });

    return browserifyObj.bundle()
        .pipe(source(pathsName.dest.jsFiles))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(pathsName.dest.js));
});

/**
 * Ejecutar el linter (ESLint) para JavaScript
 */
gulp.task('eslintNestoriaRealEstate', () => {
    return gulp.src([pathsName.source.js, pathsName.source.gulpFile, `!${pathsName.source.testJsFiles}`])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

/**
 * Ejecutar Jest para iniciar los tests unitarios
 */
gulp.task('testNestoriaRealEstate', shell.task('npm test', { ignoreErrors: true }));

/**
 * Observar los cambios y volver a ejecutar las tareas correspondientes
 */
gulp.task('watchNestoriaRealEstate', () => {
    gulp.watch(pathsName.source.css, gulp.series('sassNestoriaRealEstate'));
    gulp.watch(pathsName.source.js, gulp.series('eslintNestoriaRealEstate', 'jsNestoriaRealEstate'));
    gulp.watch(pathsName.source.images, gulp.series('assetsNestoriaRealEstate'));
    gulp.watch(pathsName.source.templates, gulp.series('htmlNestoriaRealEstate', 'cssJsInjectNestoriaRealEstate'));
});

/**
 * Tarea por defecto
 */
gulp.task('default', gulp.series('eslintNestoriaRealEstate', 'testNestoriaRealEstate', 'jsNestoriaRealEstate', 'sassNestoriaRealEstate', 'htmlNestoriaRealEstate', 'cssJsInjectNestoriaRealEstate', 'assetsNestoriaRealEstate' ,'watchNestoriaRealEstate'));
