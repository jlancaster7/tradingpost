import Repository from "./repository";
import { addSecurityPrice, getSecurityWithLatestPrice, updateSecurityPrice } from "./interfaces";
import IEX from "../iex";
export default class MarketData {
    private readonly repository;
    private readonly iex;
    constructor(repository: Repository, iex: IEX);
    prunePricing: () => Promise<void>;
    ingestEodOfDayPricing: () => Promise<void>;
    private processEndOfDayPricing;
    ingestPricing: () => Promise<void>;
    validateIsEodPrice: (symbol: string, eodPrice: any, newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]) => [addSecurityPrice[], updateSecurityPrice[]];
    resolveEodPricing: (securityGroup: getSecurityWithLatestPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]) => Promise<[addSecurityPrice[], updateSecurityPrice[]]>;
    resolve: (securityGroup: getSecurityWithLatestPrice[], newSecurityPrices: addSecurityPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]) => Promise<[addSecurityPrice[], addSecurityPrice[], updateSecurityPrice[]]>;
    private processIntradayPrices;
}
export declare const buildGroups: (securities: any[], max?: number) => any[][];
