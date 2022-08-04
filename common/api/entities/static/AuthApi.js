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
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "create"), {
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
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "init"), {
                method: "POST",
                body: JSON.stringify({
                    first_name,
                    last_name,
                    handle
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
            const resp = yield fetch((0, EntityApiBase_1.apiUrl)(this.constructor.name, "login"), {
                method: "POST",
                body: JSON.stringify({
                    email,
                    pass,
                }),
                headers: EntityApiBase_1.EntityApiBase.makeHeaders()
            });
            const result = yield EntityApiBase_1.EntityApiBase.handleFetchResponse(resp);
            //console.log("MY TOKEN IS BEING SET AS" + result.token);
            EntityApiBase_1.EntityApiBase.token = result.token;
            return result;
        });
    }
}
exports.AuthApi = AuthApi;
exports.default = new AuthApi();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF1dGhBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXdEO0FBR3hELE1BQWEsT0FBTztJQUNWLFdBQVcsQ0FBQyxLQUFhLEVBQUUsSUFBWTs7WUFDekMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBQSxzQkFBTSxFQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUM5RCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsS0FBSztvQkFDTCxJQUFJO2lCQUNQLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE1BQU0sRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBYyxJQUFJLENBQUMsQ0FBQTtZQUNyRSw2QkFBYSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQy9CLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUssVUFBVSxDQUFDLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxNQUFjOztZQUNsRSxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFBLHNCQUFNLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQzVELE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixVQUFVO29CQUNWLFNBQVM7b0JBQ1QsTUFBTTtpQkFDVCxDQUFDO2dCQUNGLE9BQU8sRUFBRSw2QkFBYSxDQUFDLFdBQVcsRUFBRTthQUN2QyxDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksR0FBRyxNQUFNLDZCQUFhLENBQUMsbUJBQW1CLENBQWMsSUFBSSxDQUFDLENBQUE7WUFDdkUsNkJBQWEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNqQyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFDRCxPQUFPO1FBQ0gsNkJBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDSyxjQUFjLENBQUMsS0FBYTs7WUFDOUIsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7S0FBQTtJQUNLLEtBQUssQ0FBQyxLQUFhLEVBQUUsSUFBWTs7WUFDbkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBQSxzQkFBTSxFQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUM3RCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsS0FBSztvQkFDTCxJQUFJO2lCQUNQLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLDZCQUFhLENBQUMsV0FBVyxFQUFFO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxtQkFBbUIsQ0FBYyxJQUFJLENBQUMsQ0FBQztZQUMxRSx5REFBeUQ7WUFDekQsNkJBQWEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNuQyxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7Q0FDSjtBQWpERCwwQkFpREM7QUFFRCxrQkFBZSxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=