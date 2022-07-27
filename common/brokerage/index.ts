import {IDatabase, IMain} from "pg-promise";
import Repository from "./repository";
import BrokerageService from "./service";
import FinicityService from "./finicity"
import Finicity from "../finicity";
import {FinicityTransformer} from "./finicity/transformer";
import {PortfolioSummaryService} from "./portfolio-summary";

export default class Brokerage extends BrokerageService {
    constructor(pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity) {
        const repo = new Repository(pgClient, pgp)
        const portSummary = new PortfolioSummaryService(repo);
        const brokerageMap = {
            "finicity": new FinicityService(finicity, repo, new FinicityTransformer(repo))
        }
        super(brokerageMap, repo, portSummary)
    }
}