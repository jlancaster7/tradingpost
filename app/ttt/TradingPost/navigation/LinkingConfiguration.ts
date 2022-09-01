/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { navIcons } from '../images';
import { screens } from '../screens/CreateAccountScreen';

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

const linking: LinkingOptions<any> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Root: "login",
      Create: {
        screens: {
          Root: {
            screens: (() => {
              const output: Record<string, string> = {}
              Object.keys(screens).map((k) => {
                output[k] = "create/" + k.toLowerCase();
              })
              return output;
            })()
          }
        }
      },
      Dash: {
        screens: {
          Root: {
            screens: (() => {
              const output: Record<string, string> = {}
              Object.keys(navIcons).map((k) => {
                output[k] = "dash/" + k.toLowerCase();
              })
              return output;
            })()
          }
        }
      },
      Auth:"auth/:platform",
      WatchlistViewer: "WatchlistViewer/:watchlistId",
      Modal: 'modal',
      NotFound: '*',
    },
  },
};

export default linking;
