"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("./repository"));
const service_1 = __importDefault(require("./service"));
const finicity_1 = __importDefault(require("./finicity"));
const transformer_1 = __importDefault(require("./finicity/transformer"));
const portfolio_summary_1 = require("./portfolio-summary");
class Brokerage extends service_1.default {
    constructor(pgClient, pgp, finicity) {
        const repo = new repository_1.default(pgClient, pgp);
        const portSummary = new portfolio_summary_1.PortfolioSummaryService(repo);
        const brokerageMap = {
            "finicity": new finicity_1.default(finicity, repo, new transformer_1.default(repo))
        };
        super(brokerageMap, repo, portSummary);
    }
}
exports.default = Brokerage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLDhEQUFzQztBQUN0Qyx3REFBeUM7QUFDekMsMERBQXdDO0FBRXhDLHlFQUF5RDtBQUN6RCwyREFBNEQ7QUFFNUQsTUFBcUIsU0FBVSxTQUFRLGlCQUFnQjtJQUNuRCxZQUFZLFFBQXdCLEVBQUUsR0FBVSxFQUFFLFFBQWtCO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQ0FBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRztZQUNqQixVQUFVLEVBQUUsSUFBSSxrQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxxQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqRixDQUFBO1FBQ0QsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDMUMsQ0FBQztDQUNKO0FBVEQsNEJBU0MifQ==