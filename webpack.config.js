const path = require('path')

module.exports = {
    mode: "development",
    entry: './src/app.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: "/dist"
    },
    devServer: {
        static: [
            {
                directory: path.resolve(__dirname, "dist"),
                publicPath: "/dist",
            },
            {
                directory: __dirname,
                publicPath: "/",
            },
        ],
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /nodemodules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}