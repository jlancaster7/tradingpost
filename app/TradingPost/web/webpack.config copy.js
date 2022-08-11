// web/webpack.config.js

const path = require('path');
//const webpack = require('webpack');
//const nodeExternals = require("webpack-node-externals");
const HTMLWebpackPlugin = require('html-webpack-plugin')

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: path.resolve(__dirname, './public/index.html'),
    filename: 'index.html',
    inject: 'body',
})
const appDirectory = path.resolve(__dirname, '../');

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
    test: /\.m?[jt]sx?$/,
    // Add every directory that needs to be compiled by Babel during the build.
    include: [
        path.resolve(appDirectory, 'index.web.tsx'),
        path.resolve(appDirectory, 'src'),
        path.resolve(appDirectory, 'node_modules/react-native-uncompiled')
    ],
    use: {
        loader: 'babel-loader',
        options: {
            presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
                "@babel/preset-typescript"
            ],
        },

    }
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
        loader: 'url-loader',
        options: {
            name: '[name].[ext]',
            esModule: false,
        }
    }
};

module.exports = {
    entry: [
        // load any web API polyfills
        // path.resolve(appDirectory, 'polyfills-web.js'),
        // your web-specific entry file
        path.resolve(appDirectory, 'index')
    ],
    //    externalsPresets: { node: true },   // <-- here
    //  externals: [nodeExternals()],       // <-- and here
    // configures where the build ends up
    output: {
        filename: 'bundle.web.js',
        path: path.resolve(appDirectory, 'dist')
    },

    // ...the rest of your config
    plugins: [HTMLWebpackPluginConfig],
    module: {
        rules: [
            // {
            //     test: /(\.web)?\.tsx?$/,
            //     use: {
            //         loader: 'ts-loader',
            //         options: {
            //             transpileOnly: true
            //         }
            //     },
            //     exclude: /node_modules/,
            // },
            babelLoaderConfiguration,
            imageLoaderConfiguration
        ]
    },

    resolve: {
        // This will only alias the exact import "react-native"
        alias: {
            'react-native$': 'react-native-web'
        },
        // If you're working on a multi-platform React Native app, web-specific
        // module implementations should be written in files using the extension
        // `.web.js`.   
        extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],

    },
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        devMiddleware: {
            writeToDisk: true,
        },
    }
}