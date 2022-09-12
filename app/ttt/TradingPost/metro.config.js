const { makeMetroConfig } = require("@rnx-kit/metro-config");
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks");
const {
    applyConfigForLinkedDependencies,
} = require('@carimus/metro-symlinked-deps');

const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");
const sharedDir = path.resolve(`${__dirname}/../../../common`);
//const sharedDir = path.resolve(`${__dirname}/../../../`);
module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    const { transformer, resolver } = config;

    // config.transformer = {
    //     ...transformer,
    //     babelTransformerPath: require.resolve("react-native-svg-transformer"),
    // };

    // config.resolver = {
    //     ...resolver,
    //     resolveRequest: MetroSymlinksResolver(),
    //     assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    //     sourceExts: [...resolver.sourceExts, "svg"],
    // };

    return (
        //makeMetroConfig({
        applyConfigForLinkedDependencies({
            projectRoot: __dirname,
            transformer: {
                ...transformer,
                babelTransformerPath: require.resolve("react-native-svg-transformer"),
            },
            resolver: {
                ...resolver,
                // extraNodeModules: new Proxy({
                //     "@tradingpost/common": sharedDir
                // }, {
                //     get: (target, name) => {
                //         // redirects dependencies referenced from shared/ to local node_modules
                //         console.log(`T:${target}, N:${name}`)
                //         return name in target
                //             ? target[name]
                //             : path.join(process.cwd(), `node_modules/${name.toString()}`);
                //     },
                // })
                // ,
                // resolveRequest: () => {

                // },
                //MetroSymlinksResolver(),
                
                assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
                sourceExts: [...resolver.sourceExts, "svg"],
            },
        }))

})();


