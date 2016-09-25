'use strict';

var gulp = require("gulp");

var imagemin = require("gulp-imagemin"), //图片压缩
    pngquant = require('imagemin-pngquant'),

    gutil = require('gulp-util'), // 运行gulp命令时添加相关参数，如gulp --skin=sky
    jshint = require("gulp-jshint"), // js代码检测

    less = require('gulp-less'), // less编译
    sass = require("gulp-sass"), // sass编译
    base64 = require('gulp-base64'), // 图片转base64编码
    pug = require('gulp-pug'), // pug模板编译

    watch = require('gulp-watch'), // 任务监听

    babel = require('gulp-babel'), // es6转换
    concat = require('gulp-concat'), //css,js合并
    uglify = require('gulp-uglify'), // js压缩
    obfuscate = require('gulp-obfuscate'), // 代码混淆

    minifyCSS = require('gulp-clean-css'), // css压缩
    rename = require('gulp-rename'), // 文件重命名

    notify = require('gulp-notify'), // 变动消息通知

    browserSync = require('browser-sync'), // 服务器
    reload = browserSync.reload,

    data = require('gulp-data');

// var  MongoClient = require('mongodb').MongoClient;
var fs = require('fs'),
    nodePath = require('path');

var path = {
    from: {
        image: './app/images/*.png',
        less: './app/less/**/*.less',
        sass: './app/sass/**/*.scss',
        js: './app/js/*.js',
        pug: './app/pug/*.pug'
    },
    to: {
        image: './app/dist/images/',
        rawcss: './app/css/',
        css: './app/dist/css/',
        js: './app/dist/js/',
        view: './app/dist/view/'
    }
}

/**
 * 编译sass, less文件。
 * @param sources  sass,less文件源；
 * @param targetFileName 目标文件名称
 * @param type 是编译sass还是less
 */
var cssCompiler = function(sources, targetFileName, type) {
    var name = type;
    type = type === 'less' ? less :
        type === 'sass' ? sass : null;
    if (type == null) {
        return;
    }
    gulp.src(sources)
        .pipe(type({
            compress: false
        }))
        .pipe(base64({
            extensions: [/\.(png|jpg)$/],
            maxImageSize: 8 * 1024,
            deleteAfterEncoding: false,
            debug: true
        }))
        .pipe(gulp.dest(path.to.rawcss)) // 读取的目标文件夹下有子文件夹，编译后会自动创建相对应的子文件夹
        .pipe(notify({
            message: name + ' 编译完成!'
        }))
        // .pipe(concat(targetFileName))
        // .pipe(notify({
        //     message: name + ' 合并完成!'
        // }))
        .pipe(gulp.dest(path.to.css))
        .pipe(reload({
            stream: true
        }))
        .pipe(minifyCSS({
            noAdvanced: true
        }))
        .pipe(rename({
            suffix: '.min',
            extname: ".css"
        }))
        .pipe(gulp.dest(path.to.css))
        .pipe(notify({
            message: name + ' 压缩完成!'
        }))
        .pipe(reload({
            stream: true
        }))
}


gulp.task('compress_image', function() {
    return gulp.src('./app/images/*.png')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./app/dist/minimage'));
})

// sass编译，监听
gulp.task('sass', function() {
    var src = ['./app/sass/ui.scss', './app/sass/app/app.scss'];
    cssCompiler(src, '', 'sass');
})

//pug编译
gulp.task('pug', function() {
    var src = './app/pug/demo/*.pug';
    gulp.src(src)
        .pipe(pug({
            pretty: true
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulp.dest('./app/htmldemo'))
        .pipe(notify({
            message: 'pug task is OK'
        }))
        .pipe(reload({
            stream: true
        }))
})

//合并压缩JS文件
gulp.task("js", function() {
    gulp.src(['./app/js/core/core.js', path.from.js, './app/js/component/*.js',
            '!./app/js/pui.js', '!./app/js/pullrefresh.js', '!./app/js/rgbaster.js', '!./app/js/seats.js'
        ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(reload({
            stream: true
        }))
        .pipe(jshint.reporter('default'))
        .pipe(concat("pui.js"))
        .pipe(gulp.dest(path.to.js))
        .pipe(rename({
            suffix: '.min',
            extname: ".js"
        }))
        .pipe(uglify())
        .pipe(notify({
            message: 'js task is OK'
        }))
        // .pipe(obfuscate())
        .pipe(gulp.dest(path.to.js))
        .pipe(reload({
            stream: true
        }))
});

// 选座页js，由于各种逻辑的js全部放入到该文件，分开压缩，分开引入。
gulp.task('seatjs', function() {
    gulp.src('./app/js/seats.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(reload({
            stream: true
        }))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(path.to.js))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(uglify())
        .pipe(notify({
            message: 'seatjs task is OK'
        }))
        .pipe(gulp.dest(path.to.js))
        .pipe(reload({
            stream: true
        }))
});

gulp.task('render', function() {
    var jsonData = null;
    var src = [path.from.pug, '!./app/pug/common.pug', '!./app/pug/head.pug', '!./app/pug/page_search.pug'];
    return gulp.src(src)
        .pipe(data(function(file) {
            var filename = nodePath.basename(file.path).replace(/\.pug$/, '');
            return jsonData = JSON.parse(fs.readFileSync('./app/data/' + filename + '.json'));
        }))
        .pipe(pug({
            pretty: true,
            locals: jsonData // 此处应该会有更pretty写法
        }))
        .pipe(gulp.dest('./app/dist/view/'))
        .pipe(notify({
            message: '模板渲染成功!'
        }))
        .pipe(reload({
            stream: true
        }))
})

/**
 * 读取数据库
 */
gulp.task('render-database', function() {
    gulp.src('./app/pug/database.pug')
        .pipe(data(function(file, callback) {
            MongoClient.connect('mongodb://127.0.0.1/test', function(err, db) {
                if (err) {
                    return callback(err);
                }
                // var w = fs.createWriteStream('.app/data/database.json');
                var d = db.collection('movies').find();
                // var result = callback(undefined, db.collection('movies').find())
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./app/dist/view/'))

})

gulp.task('server', ['sass', 'render', 'js', 'seatjs'], function() {
    browserSync({
        server: {
            baseDir: 'app'
        }
    })

    //监听sass变化
    gulp.watch("./app/sass/**/*.scss", ['sass']);
    // 监听less变化
    // gulp.watch("./app/less/*.less", ['less']);
    // 监听pug模板变化
    gulp.watch(['./app/pug/*.pug', './app/data/*.json'], ['render']);
    // 监听js变化
    gulp.watch('./app/js/**/*.js', ['js', 'seatjs']);

})


// 测试组件的demo
gulp.task('test', ['sass', 'pug', 'js'], function() {
    browserSync({
        server: {
            baseDir: 'app'
        }
    })

    //监听sass变化
    gulp.watch("./app/sass/*.scss", ['sass']);

    gulp.watch(['./app/pug/demo/*.pug'], ['pug']);

    gulp.watch(['./app/js/**/*.js'], ['js']);
})


// 源文件备份，因为会出现误操作删除了源文件
// 不监听，因为监听会出现误操作覆盖了备份
gulp.task('backup', function() {
    gulp.src(['./app/sass/**/*.scss'])
        .pipe(gulp.dest('./app/backup/scss'));

    gulp.src(['./app/pug/**/*.pug'])
        .pipe(gulp.dest('./app/backup/pug'));

    gulp.src(['./app/js/*.js'])
        .pipe(gulp.dest('./app/backup/js'));
})