"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("./"));
class default_1 extends _1.default {
    constructor() {
        super(...arguments);
        this.list = this._makeFetch("list", this._defaultPostRequest);
        this.quickadd = this._makeFetch("quickadd", this._defaultPostRequest);
        this.getPrices = this._makeFetch('getPrices', this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZWN1cml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBDQUEyQjtBQUczQixlQUFxQixTQUFRLFVBQVM7SUFBdEM7O1FBQ0ksU0FBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQTZCLE1BQU0sRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNwRixhQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBeUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3hHLGNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUE4RixXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDbkssQ0FBQztDQUFBO0FBSkQsNEJBSUMifQ==