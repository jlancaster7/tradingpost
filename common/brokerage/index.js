"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("./repository"));
const service_1 = __importDefault(require("./service"));
const finicity_1 = __importDefault(require("./finicity"));
const transformer_1 = require("./finicity/transformer");
const portfolio_summary_1 = require("./portfolio-summary");
class Brokerage extends service_1.default {
    constructor(pgClient, pgp, finicity) {
        const repo = new repository_1.default(pgClient, pgp);
        const portSummary = new portfolio_summary_1.PortfolioSummaryService(repo);
        const brokerageMap = {
            "finicity": new finicity_1.default(finicity, repo, new transformer_1.FinicityTransformer(repo))
        };
        super(brokerageMap, repo, portSummary);
    }
}
exports.default = Brokerage;
