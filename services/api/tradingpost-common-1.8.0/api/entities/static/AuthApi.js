"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthApi = void 0;
const EntityApiBase_1 = require("./EntityApiBase");
class AuthApi {
    createLogin(email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)("AuthApi", "create"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    pass,
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const lr = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            EntityApiBase_1.EntityApiBase.token = lr.token;
            return lr;
        });
    }
    createUser(first_name, last_name, handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)("AuthApi", "init"), {
                method: "POST",
                body: JSON.stringify({
                    first_name,
                    last_name,
                    handle,
                    dummy: false
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const user = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            EntityApiBase_1.EntityApiBase.token = user.token;
            return user;
        });
    }
    signOut() {
        EntityApiBase_1.EntityApiBase.token = "";
    }
    loginWithToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.login("", token);
        });
    }
    login(email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)("AuthApi", "login"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    pass,
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const result = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            EntityApiBase_1.EntityApiBase.token = result.token;
            return result;
        });
    }
    resetPassword(email, tokenOrPass, isPass, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)("AuthApi", "resetpassword"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    tokenOrPass,
                    isPass,
                    newPassword
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const result = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            return result;
        });
    }
    forgotPassword(email, callbackUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)("AuthApi", "forgotpassword"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    callbackUrl
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const result = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            return result;
        });
    }
}
exports.AuthApi = AuthApi;
exports.default = new AuthApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF1dGhBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXdEO0FBR3hELE1BQWEsT0FBTztJQUNWLFdBQVcsQ0FBQyxLQUFhLEVBQUUsSUFBWTs7WUFDekMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBQSxzQkFBTSxFQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDbEQsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2pCLEtBQUs7b0JBQ0wsSUFBSTtpQkFDUCxDQUFDO2dCQUNGLE9BQU8sRUFBRSw2QkFBYSxDQUFDLFdBQVcsRUFBRTthQUN2QyxDQUFDLENBQUM7WUFDSCxNQUFNLEVBQUUsR0FBRyxNQUFNLDZCQUFhLENBQUMsbUJBQW1CLENBQWMsSUFBSSxDQUFDLENBQUE7WUFDckUsNkJBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUMvQixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVLLFVBQVUsQ0FBQyxVQUFrQixFQUFFLFNBQWlCLEVBQUUsTUFBYzs7WUFDbEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBQSxzQkFBTSxFQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2pCLFVBQVU7b0JBQ1YsU0FBUztvQkFDVCxNQUFNO29CQUNOLEtBQUssRUFBRSxLQUFLO2lCQUNmLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBYyxJQUFJLENBQUMsQ0FBQTtZQUN2RSw2QkFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2pDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUNELE9BQU87UUFDSCw2QkFBYSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNLLGNBQWMsQ0FBQyxLQUFhOztZQUM5QixPQUFPLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUFBO0lBQ0ssS0FBSyxDQUFDLEtBQWEsRUFBRSxJQUFZOztZQUNuQyxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFBLHNCQUFNLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNqRCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsS0FBSztvQkFDTCxJQUFJO2lCQUNQLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBYyxJQUFJLENBQUMsQ0FBQztZQUUxRSw2QkFBYSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ25DLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUNLLGFBQWEsQ0FBQyxLQUFhLEVBQUUsV0FBbUIsRUFBRSxNQUFlLEVBQUUsV0FBbUI7O1lBQ3hGLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLElBQUEsc0JBQU0sRUFBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUU7Z0JBQ3pELE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixLQUFLO29CQUNMLFdBQVc7b0JBQ1gsTUFBTTtvQkFDTixXQUFXO2lCQUNkLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFSyxjQUFjLENBQUMsS0FBYSxFQUFFLFdBQW1COztZQUNuRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFBLHNCQUFNLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzFELE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixLQUFLO29CQUNMLFdBQVc7aUJBQ2QsQ0FBQztnQkFDRixPQUFPLEVBQUUsNkJBQWEsQ0FBQyxXQUFXLEVBQUU7YUFDdkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSw2QkFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtDQUNKO0FBN0VELDBCQTZFQztBQUVELGtCQUFlLElBQUksT0FBTyxFQUFFLENBQUMifQ==