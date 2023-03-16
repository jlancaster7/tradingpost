"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
class default_1 extends _1.default {
    constructor() {
        super(...arguments);
        this.getAllWatchlists = this._makeFetch("getAllWatchlists", this._defaultPostRequest);
        this.saveWatchlist = this._makeFetch("saveWatchlist", this._defaultPostRequest);
        this.toggleNotification = this._makeFetch("toggleNotification", this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiV2F0Y2hsaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQTBCO0FBUTFCLGVBQXFCLFNBQVEsVUFBUztJQUF0Qzs7UUFDSSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUEyQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMxRyxrQkFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQXFFLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUM5SSx1QkFBa0IsR0FBRSxJQUFJLENBQUMsVUFBVSxDQUFvRCxvQkFBb0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUMxSSxDQUFDO0NBQUE7QUFKRCw0QkFJQyJ9