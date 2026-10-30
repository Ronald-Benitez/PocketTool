const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mermaid is shipped as a `.txt` asset so Metro does not compile the 3.5 MB
// browser bundle as application source. It is read at runtime and injected into
// the WebView for offline diagrams.
if (!config.resolver.assetExts.includes('txt')) {
  config.resolver.assetExts.push('txt');
}

module.exports = config;
