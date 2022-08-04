import { IDatabase, IMain } from "pg-promise";
import BrokerageService from "./service";
import Finicity from "../finicity";
export default class Brokerage extends BrokerageService {
    constructor(pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity);
}
