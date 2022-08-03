"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class User extends index_1.Extension {
    constructor() {
        super(...arguments);
        this.uploadProfilePic = this._makeFetch("uploadProfilePic", (s) => ({
            method: "POST",
            body: JSON.stringify(s)
        }));
        this.generateBrokerageLink = this._makeFetch("generateBrokerageLink", (s) => ({
            method: "POST"
        }));
    }
}
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBbUM7QUFJbkMsTUFBcUIsSUFBSyxTQUFRLGlCQUFTO0lBQTNDOztRQUNJLHFCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQXVCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzFCLENBQUMsQ0FBQyxDQUFBO1FBQ0gsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBOEIsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEcsTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQyxDQUFDLENBQUE7SUFFUCxDQUFDO0NBQUE7QUFURCx1QkFTQyJ9