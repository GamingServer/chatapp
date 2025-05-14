const path = require('path');

module.exports = {
    mode: 'development', // or 'production'
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,          // Match JS and JSX files
                exclude: /node_modules/,      // Exclude node_modules
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            }

        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],     // Support both JS and JSX
    },
};
