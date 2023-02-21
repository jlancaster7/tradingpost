"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
class Subscription extends _1.default {
    constructor() {
        super(...arguments);
        this.getByUserId = this._makeFetch("getByUserId", this._defaultPostRequest);
    }
}
exports.default = Subscription;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3Vic2NyaXB0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQTBCO0FBRzFCLE1BQXFCLFlBQWEsU0FBUSxVQUFTO0lBQW5EOztRQUNJLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBcUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQzlHLENBQUM7Q0FBQTtBQUZELCtCQUVDIn0=