const path = require("path")
require("dotenv").config()
const merge = require("webpack-merge")
const config = require("./webpack.config.js")

module.exports = merge(config, {
    devServer: {
        contentBase: (process.env.DIR_PATH || ".") + "examples",
        compress: true,
        port: 9000
    }
})