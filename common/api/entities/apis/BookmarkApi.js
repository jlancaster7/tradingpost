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
var BookmarkApi = /** @class */ (function (_super) {
    __extends(BookmarkApi, _super);
    function BookmarkApi() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getFunction = "public.api_bookmark_get";
        _this.listFunction = "public.api_bookmark_list";
        _this.insertFunction = "public.api_bookmark_insert";
        _this.updateFunction = "public.api_bookmark_update";
        return _this;
        /*extensions*/
    }
    return BookmarkApi;
}(EntityApi_1.EntityApi));
exports.default = new BookmarkApi();
