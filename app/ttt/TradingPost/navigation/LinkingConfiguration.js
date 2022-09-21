"use strict";
/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */
exports.__esModule = true;
var Linking = require("expo-linking");
var images_1 = require("../images");
var CreateAccountScreen_1 = require("../screens/CreateAccountScreen");
var ConfigOverride = {
// "Notification": {
//   screens: {
//     Root: "dash/notifications",
//     screens: {
//       NotificationTrade: "dash/notification/trades"
//     }
//   }
// }
};
//import { RootStackParamList } from '../types';
// const linking: LinkingOptions<any> = {
//   prefixes: [Linking.createURL('/')],
//   config: {
//     screens: {
//       Root: {
//         screens: {
//           TabOne: {
//             screens: {
//               TabOneScreen: 'one',
//             },
//           },
//           TabTwo: {
//             screens: {
//               TabTwoScreen: 'two',
//             },
//           },
//         },
//       },
//       Modal: 'modal',
//       NotFound: '*',
//     },
//   },
// };
var linking = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Root: "login",
            Create: {
                screens: {
                    Root: {
                        screens: (function () {
                            var output = {};
                            Object.keys(CreateAccountScreen_1.screens).map(function (k) {
                                output[k] = "create/" + k.toLowerCase();
                            });
                            return output;
                        })()
                    }
                }
            },
            Dash: {
                screens: {
                    Root: {
                        screens: (function () {
                            var output = {};
                            Object.keys(images_1.navIcons).map(function (k) {
                                output[k] = ConfigOverride[k] || "dash/" + k.toLowerCase();
                            });
                            return output;
                        })()
                    }
                }
            },
            Auth: "auth/:platform",
            WatchlistViewer: "WatchlistViewer/:watchlistId",
            Modal: 'modal',
            NotFound: '*'
        }
    }
};
exports["default"] = linking;
