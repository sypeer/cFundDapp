const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: "./src/campaign.html", to: "campaign.html" },
      { from: "./src/start_campaign.html", to: "start_campaign.html" },
      { from: "./src/app.css", to: "app.css"}
    ]),
  ],
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};
