"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntityApi_1 = require("./EntityApi");
var CommentApi = /** @class */ (function (_super) {
    __extends(CommentApi, _super);
    function CommentApi() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getFunction = "public.api_comment_get";
        _this.listFunction = "public.api_comment_list";
        _this.insertFunction = "public.api_comment_insert";
        _this.updateFunction = "public.api_comment_update";
        return _this;
        /*extensions*/
    }
    return CommentApi;
}(EntityApi_1.EntityApi));
exports.default = new CommentApi();
