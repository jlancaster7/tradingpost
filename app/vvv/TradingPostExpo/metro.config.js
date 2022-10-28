const { getDefaultConfig } = require("@expo/metro-config");
const {
    applyConfigForLinkedDependencies,
} = require('@carimus/metro-symlinked-deps');


module.exports = (() => {
    const config = getDefaultConfig(__dirname);
    const { transformer, resolver } = config;

    //console.log("###################TEST###########:" + resolver.blacklistRE);

    return applyConfigForLinkedDependencies({
        projectRoot: __dirname,
        transformer: {
            ...transformer,
            babelTransformerPath: require.resolve("react-native-svg-transformer"),
        },
        resolver: {
            ...resolver,
            assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
            sourceExts: [...resolver.sourceExts, "svg"]
        }
    })
})();