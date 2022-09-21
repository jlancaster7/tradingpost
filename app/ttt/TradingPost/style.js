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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.textInputWiz = exports.thinBannerText = exports.bannerText = exports.social = exports.chartColors = exports.elevated = exports.paddViewWhite = exports.paddView = exports.sizes = exports.font = exports.fonts = exports.rounded = exports.noMargin = exports.shadow = exports.row = exports.flex = void 0;
var Colors_1 = require("./constants/Colors");
exports.flex = { flex: 1 };
exports.row = { flexDirection: "row" };
exports.shadow = {
    elevation: 4,
    shadowOffset: { height: 2, width: 2 },
    shadowColor: "black",
    shadowOpacity: 0.125,
    shadowRadius: 0.25
};
exports.noMargin = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0
};
function rounded(size) {
    return {
        height: size,
        width: size,
        borderRadius: size / 2
    };
}
exports.rounded = rounded;
exports.fonts = {
    xSmall: 12,
    small: 16,
    medium: 20,
    large: 24,
    xLarge: 32
};
function font(size, color, isBold) {
    if (color === void 0) { color = "black"; }
    if (isBold === void 0) { isBold = false; }
    return {
        fontSize: exports.fonts[size],
        fontWeight: isBold ? "bold" : undefined,
        color: color
    };
}
exports.font = font;
exports.sizes = {
    rem0_5: 8,
    rem1: 16,
    rem1_5: 24,
    rem2: 32,
    rem4: 64,
    rem6: 96,
    rem7: 112,
    rem8: 128,
    rem9: 144,
    rem10: 160,
    rem12: 192,
    rem16: 256,
    borderRadius: 2
};
exports.paddView = [exports.flex, { padding: exports.sizes.rem1, backgroundColor: Colors_1.AppColors.background }];
exports.paddViewWhite = __spreadArray(__spreadArray([], exports.paddView, true), [{ backgroundColor: "white" }], false);
exports.elevated = __assign({ marginHorizontal: 2, paddingVertical: 8, backgroundColor: "white", borderColor: "#ccc", borderWidth: 1, borderRadius: 4, marginBottom: 16 }, exports.shadow);
exports.chartColors = [
    '#2dadf4',
    '#f5523b',
    '#66a1fa',
    '#ff4a6b',
    '#9891f4',
    '#f95399',
    '#c37de1',
    '#e567c1'
];
exports.social = {
    substackColor: '#ff7731'
};
exports.bannerText = {
    textAlign: "center", margin: exports.sizes.rem2, fontSize: exports.fonts.large, lineHeight: exports.fonts.large * 1.5
};
exports.thinBannerText = [exports.bannerText, {
        marginHorizontal: 0, marginVertical: exports.sizes.rem0_5
    }];
exports.textInputWiz = {
    marginVertical: exports.sizes.rem0_5
};
