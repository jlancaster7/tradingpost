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
exports.__esModule = true;
exports.SvgExpo = void 0;
var react_1 = require("react");
var SvgExpo = function (props) {
    var propsCopy = __assign(__assign({}, props), { children: undefined });
    return <>{react_1.Children.map(props.children, function (child) {
            var TP = child.type;
            return <TP {...propsCopy}/>;
        })}</>;
};
exports.SvgExpo = SvgExpo;
