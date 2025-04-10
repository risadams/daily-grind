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
    hot: true, // Enable Hot Module Replacement
    liveReload: true, // Enable live reloading
    watchFiles: ['src/**/*'], // Watch for changes in src directory
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: '/ws',
        port: 0,
      },
      overlay: true, // Show errors as overlay on screen
      progress: true, // Show compilation progress
    },
    allowedHosts: 'all', // Allow all hosts to connect
    setupMiddlewares: (middlewares, devServer) => {
      // Add any custom middleware here
      return middlewares;
    }
  }
};