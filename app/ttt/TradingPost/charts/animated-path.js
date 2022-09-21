"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var react_1 = require("react");
var react_native_1 = require("react-native");
var prop_types_1 = require("prop-types");
var react_native_svg_1 = require("react-native-svg");
var interpolate = require("d3-interpolate-path");
var AnimatedPath = /** @class */ (function (_super) {
    __extends(AnimatedPath, _super);
    function AnimatedPath(props) {
        var _this = _super.call(this, props) || this;
        _this.animation = 0;
        _this.state = { d: props.d };
        return _this;
    }
    AnimatedPath.prototype.componentDidUpdate = function (props) {
        var _a = this.props, newD = _a.d, animate = _a.animate;
        var oldD = props.d;
        this.newD = newD;
        if (newD === oldD) {
            return;
        }
        if (!animate || newD === null || oldD === null) {
            return;
        }
        this.newD = newD;
        this.interpolator = interpolate.interpolatePath(oldD, newD);
        this._animate();
    };
    AnimatedPath.prototype.componentWillUnmount = function () {
        cancelAnimationFrame(this.animation);
        this._clearInteraction();
    };
    AnimatedPath.prototype._animate = function (start) {
        var _this = this;
        cancelAnimationFrame(this.animation);
        this.animation = requestAnimationFrame(function (timestamp) {
            if (!start) {
                _this._clearInteraction();
                _this.handle = react_native_1.InteractionManager.createInteractionHandle();
                start = timestamp;
            }
            // Get the delta on how far long in our animation we are.
            var delta = (timestamp - start) / _this.props.animationDuration;
            // If we're above 1 then our animation should be complete.
            if (delta > 1) {
                // Just to be safe set our final value to the new graph path.
                _this.component.setNativeProps({ d: _this.newD });
                // Stop our animation loop.
                _this._clearInteraction();
                return;
            }
            var d = _this.interpolator ? _this.interpolator(delta) : 0;
            _this.component.setNativeProps({ d: d });
            // console.log(this.interpolator)
            // this.tween && console.log(this.tween.tween(delta))
            // Tween the SVG path value according to what delta we're currently at.
            // Update our state with the new tween value and then jump back into
            // this loop.
            _this.setState(_this.state, function () {
                _this._animate(start);
            });
        });
    };
    AnimatedPath.prototype._clearInteraction = function () {
        if (this.handle) {
            react_native_1.InteractionManager.clearInteractionHandle(this.handle);
            this.handle = null;
        }
    };
    AnimatedPath.prototype.render = function () {
        var _this = this;
        return (<react_native_svg_1.Path ref={function (ref) { return (_this.component = ref); }} {...this.props} d={this.props.animate ? this.state.d : this.props.d}/>);
    };
    return AnimatedPath;
}(react_1.Component));
AnimatedPath.propTypes = __assign({ animate: prop_types_1["default"].bool, animationDuration: prop_types_1["default"].number, renderPlaceholder: prop_types_1["default"].func }, react_native_svg_1.Path.propTypes);
AnimatedPath.defaultProps = {
    animate: false,
    animationDuration: 300,
    renderPlaceholder: function () { return null; }
};
exports["default"] = AnimatedPath;
