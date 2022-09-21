"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b, _c;
exports.__esModule = true;
var EntityApiBase_1 = require("@tradingpost/common/api/entities/static/EntityApiBase");
var expo_constants_1 = require("expo-constants");
if (!__DEV__) {
    (0, EntityApiBase_1.configApi)({
        apiBaseUrl: "https://api.tradingpostapp.com"
    });
}
else if (__DEV__ && expo_constants_1.AppOwnership.Expo === expo_constants_1["default"].appOwnership) {
    console.log("BUNLDE URL IS " + ((_a = expo_constants_1["default"].manifest) === null || _a === void 0 ? void 0 : _a.hostUri));
    (0, EntityApiBase_1.configApi)({
        apiBaseUrl: "http://".concat((_c = (_b = expo_constants_1["default"].manifest) === null || _b === void 0 ? void 0 : _b.hostUri) === null || _c === void 0 ? void 0 : _c.split(":")[0], ":8082")
    });
}
var expo_status_bar_1 = require("expo-status-bar");
//import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Colors } from 'react-native-ui-lib';
var useCachedResources_1 = require("./hooks/useCachedResources");
var useColorScheme_1 = require("./hooks/useColorScheme");
var navigation_1 = require("./navigation");
var react_native_1 = require("react-native");
var eva = require("@eva-design/eva");
var components_1 = require("@ui-kitten/components");
var theme_light_json_1 = require("./theme-light.json"); // <-- Import app theme
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var lds_1 = require("./lds");
var react_1 = require("react");
var eva_icons_1 = require("@ui-kitten/eva-icons");
var Authentication_1 = require("./Authentication");
// Colors.loadColors({
//   primary: '#11146F',
//   //primaryColor: '#2364AA',
//   //secondaryColor: '#81C3D7',
//   secondary: '#35A265',
//   lightBlue: "#cae9fb"
//   //textColor: '#221D23',
//   //errorColor: '#E63B2E',
//   //successColor: '#ADC76F',
//   //warnColor: '#FF963C'
// });
react_native_1.LogBox.ignoreAllLogs();
function App() {
    var isLoadingComplete = (0, useCachedResources_1["default"])().isLoadingComplete;
    var colorScheme = (0, useColorScheme_1["default"])();
    var _a = (0, Authentication_1.useAppUser)(), appUser = _a.appUser, signIn = _a.signIn;
    var _b = (0, lds_1.useData)("authToken"), authToken = _b.value, setAuthToken = _b.setValue;
    //try auth signin
    (0, react_1.useEffect)(function () {
        if (authToken) {
            signIn("", authToken);
        }
    }, [Boolean(authToken)]);
    (0, react_1.useEffect)(function () {
        if (isLoadingComplete) {
            //needed to add a delay to this request. It is not working if done prior to this
            setTimeout(function () {
                console.log("TRYING TO LOAD SECURITIES");
                require('./utils/hooks');
            }, 4000);
        }
    }, [isLoadingComplete]);
    if (!isLoadingComplete) {
        return null;
    }
    return <components_1.ApplicationProvider {...eva} theme={__assign(__assign({}, eva.light), theme_light_json_1["default"])}>
    <components_1.IconRegistry icons={eva_icons_1.EvaIconsPack}/>
    <react_native_toast_notifications_1.ToastProvider>
      <navigation_1["default"] colorScheme={colorScheme}/>
      <expo_status_bar_1.StatusBar />
    </react_native_toast_notifications_1.ToastProvider>
  </components_1.ApplicationProvider>;
}
exports["default"] = App;
