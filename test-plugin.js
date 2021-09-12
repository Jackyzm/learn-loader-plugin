const { ConcatSource } = require('webpack-sources');

class TestWebpackPlugin {
    apply(compiler) {
        // 指定一个挂载到 webpack 自身的事件钩子。
        // https://www.webpackjs.com/api/compiler-hooks/
        // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
        // emit 钩子是生成资源到 output 目录之前执行，emit 是一个异步串行钩子，需要用 tapAsync 来注册
        // https://webpack.docschina.org/api/compiler-hooks/
        compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin', (compilation, callback) => {
            // 回调方式注册异步钩子
            const copyrightText = '版权所有';
            // compilation存放了这次打包的所有内容
            // 所有待生成的文件都在它的 assets 属性上
            // https://webpack.docschina.org/api/compilation-hooks/
            compilation.assets['copyright.txt'] = new ConcatSource({
                // 添加copyright.txt
                source: function () {
                    return copyrightText
                },
                size: function () {
                    // 文件大小
                    return copyrightText.length
                },
            })
            callback() // 必须调用
        })
    };
};

module.exports = TestWebpackPlugin;