const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './server/index.tsx',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.resolve('server-build'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx', '.tsx'],
    },
    module: {
        rules: [
            {
                rules: [
                    {
                        test: /\.(ts|tsx)$/,
                        exclude: /node_modules/,
                        loader: "babel-loader",
                    },
                ],
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
            },
            {
                test: /\.(png|jp(e*)g|svg|gif|pdf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            publicPath: '/static/media',
                            outputPath: '../build/static/media',
                            name: '[name].[contenthash].[ext]',
                        },
                    },
                ],
            },
        ]
    }
};