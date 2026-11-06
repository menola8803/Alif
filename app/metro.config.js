// The book "Iqraʾa! Lär dig läsa arabiska" is bundled as a PDF asset.
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('pdf');
module.exports = config;
