const path = require('path');
const TestWebpackPlugin = require('./test-plugin');

module.exports = {
    // mode: 'production',
    mode: 'development',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        // loader: path.resolve('./test-loader.js'),
                        loader: path.resolve('test-loader'),
                        options: {
                            key: 'var'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new TestWebpackPlugin()
    ]
};