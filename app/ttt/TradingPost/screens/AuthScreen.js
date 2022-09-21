"use strict";
exports.__esModule = true;
exports.AuthScreen = void 0;
var async_storage_1 = require("@react-native-async-storage/async-storage");
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var AuthScreen = function (props) {
    var _a, _b, _c, _d;
    var platform = (_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.platform;
    var code = (_d = (_c = props.route) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.code;
    (0, react_1.useEffect)(function () {
        if (platform === "twitter" && code) {
            async_storage_1["default"].setItem("auth-".concat(platform, "-code"), code);
        }
        //redundant but I may change this
        else if (platform === "finicity") {
            async_storage_1["default"].setItem("auth-".concat(platform, "-code"), "DONE!");
        }
    }, [platform, code]);
    return <components_1.Text>You have been authozied to {platform || "Missing platform"}</components_1.Text>;
};
exports.AuthScreen = AuthScreen;
