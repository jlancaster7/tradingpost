"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
class default_1 extends _1.default {
    constructor() {
        super(...arguments);
        this.listAlerts = this._makeFetch("listAlerts", this._defaultPostRequest);
        this.listTrades = this._makeFetch("listTrades", this._defaultPostRequest);
        this.registerUserDevice = this._makeFetch("registerUserDevice", this._defaultPostRequest);
        this.updateUserDeviceTimezone = this._makeFetch("updateUserDeviceTimezone", this._defaultPostRequest);
        this.seenNotifications = this._makeFetch("seenNotifications", this._defaultPostRequest);
        this.hasNotifications = this._makeFetch("hasNotifications", this._defaultPostRequest);
        this.updateNotification = this._makeFetch("updateNotification", this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQTBCO0FBRzFCLGVBQXFCLFNBQVEsVUFBUztJQUF0Qzs7UUFDSSxlQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBMEQsWUFBWSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzdILGVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUEwRCxZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDN0gsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBK0Qsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbEosNkJBQXdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBNkMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDNUksc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBb0MsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDckgscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0Msa0JBQWtCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDaEgsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBeUIsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakgsQ0FBQztDQUFBO0FBUkQsNEJBUUMifQ==