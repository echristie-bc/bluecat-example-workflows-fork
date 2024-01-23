/*
Copyright 2024 BlueCat Networks Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        entry: {
            updateTextRecord: './src/pages/updateTextRecord/index.js',
        },
        output: {
            path: path.join(
                __dirname,
                '../../../workspace/workflows/Manage text record/update_text_record/',
            ),
            publicPath: '/update_text_record/',
            filename: 'js/[name].js',
            assetModuleFilename: 'img/[name][ext]',
        },
        mode: process.env.NODE_ENV || 'development',
        resolve: {
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            alias: {
                react: 'preact/compat',
                'react-dom': 'preact/compat',
            },
        },
        devServer: {
            proxy: {
                '/': {
                    target: 'http://localhost:8001',
                },
            },
            static: path.join(__dirname, 'src'),
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                    exclude: /(node_modules|bower_components)/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.(css|scss)$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.less$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'less-loader',
                        },
                    ],
                },
                {
                    test: /\.(svg|png)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff|woff2)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[hash][ext]',
                    },
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'src', 'index.html'),
                filename: 'html/updateTextRecord/index.html',
                chunks: ['updateTextRecord'],
            }),
        ],
    },
];
