"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobinhoodChallengeStatus = exports.RobinhoodLoginStatus = void 0;
const _1 = __importDefault(require("./"));
var RobinhoodLoginStatus;
(function (RobinhoodLoginStatus) {
    RobinhoodLoginStatus["DEVICE_APPROVAL"] = "DEVICE_APPROVAL";
    RobinhoodLoginStatus["MFA"] = "MFA";
    RobinhoodLoginStatus["SUCCESS"] = "SUCCESS";
    RobinhoodLoginStatus["ERROR"] = "ERROR";
})(RobinhoodLoginStatus = exports.RobinhoodLoginStatus || (exports.RobinhoodLoginStatus = {}));
var RobinhoodChallengeStatus;
(function (RobinhoodChallengeStatus) {
    RobinhoodChallengeStatus["Issued"] = "issued";
    RobinhoodChallengeStatus["Redeemed"] = "redeemed";
    RobinhoodChallengeStatus["Validated"] = "validated";
    RobinhoodChallengeStatus["Unknown"] = "unknown";
})(RobinhoodChallengeStatus = exports.RobinhoodChallengeStatus || (exports.RobinhoodChallengeStatus = {}));
class default_1 extends _1.default {
    constructor() {
        super(...arguments);
        this.robinhoodLogin = this._makeFetch("robinhoodLogin", this._defaultPostRequest);
        this.hoodPing = this._makeFetch("hoodPing", this._defaultPostRequest);
        this.scheduleForDeletion = this._makeFetch("scheduleForDeletion", this._defaultPostRequest);
        this.createIbkrAccounts = this._makeFetch("createIbkrAccounts", this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJva2VyYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQnJva2VyYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBDQUEyQjtBQVUzQixJQUFZLG9CQUtYO0FBTEQsV0FBWSxvQkFBb0I7SUFDNUIsMkRBQW1DLENBQUE7SUFDbkMsbUNBQVcsQ0FBQTtJQUNYLDJDQUFtQixDQUFBO0lBQ25CLHVDQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUxXLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBSy9CO0FBU0QsSUFBWSx3QkFLWDtBQUxELFdBQVksd0JBQXdCO0lBQ2hDLDZDQUFpQixDQUFBO0lBQ2pCLGlEQUFxQixDQUFBO0lBQ3JCLG1EQUF1QixDQUFBO0lBQ3ZCLCtDQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUFMVyx3QkFBd0IsR0FBeEIsZ0NBQXdCLEtBQXhCLGdDQUF3QixRQUtuQztBQUVELGVBQXFCLFNBQVEsVUFBUztJQUF0Qzs7UUFDSSxtQkFBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQWdELGdCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNILGFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF1RSxVQUFVLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDdEksd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBNkQscUJBQXFCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbEosdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0Msb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDdkgsQ0FBQztDQUFBO0FBTEQsNEJBS0MifQ==