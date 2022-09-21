"use strict";
exports.__esModule = true;
exports.useChangeLock = exports.sideMargin = void 0;
var react_1 = require("react");
var style_1 = require("../../style");
exports.sideMargin = style_1.sizes.rem1_5;
//export type AuthAccountProps = CreateAccountProps & { user: IEntity<IAuthenticatedUser> }
function useChangeLock(caProps, otherEntities) {
    var output = (0, react_1.useState)(caProps.saveOnly || false);
    var setLockButtons = output[1];
    (0, react_1.useEffect)(function () {
        if (caProps.saveOnly) {
            var otherHasChanged = Boolean(otherEntities === null || otherEntities === void 0 ? void 0 : otherEntities.find(function (e) { return e.hasChanged; }));
            setLockButtons(!(otherHasChanged || caProps.user.hasChanged));
        }
    }, [caProps.saveOnly, caProps.user.hasChanged, otherEntities]);
    return output;
}
exports.useChangeLock = useChangeLock;
