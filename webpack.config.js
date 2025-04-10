// Custom webpack configuration to fix deprecation warnings
module.exports = {
  // Keep the existing webpack configuration
  webpack: {
    configure: (webpackConfig) => {
      // Return the customized config
      return webpackConfig;
    }
  },
  // Fix for webpack-dev-server deprecation warnings
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Add any custom middleware here
      return middlewares;
    }
  }
};