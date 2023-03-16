import Repository from "./repository";
import IEX from "../iex";
export default class MarketData {
    private readonly repository;
    private readonly iex;
    constructor(repository: Repository, iex: IEX);
    prunePricing: () => Promise<void>;
    ingestEodOfDayPricing: () => Promise<void>;
    private _processEod;
    ingestPricing: () => Promise<void>;
    private _process;
}
