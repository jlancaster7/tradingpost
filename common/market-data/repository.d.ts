import { addSecurity, getSecurityBySymbol, getUSExchangeHoliday, addUSHoliday, getExchange, addExchange, upsertSecuritiesInformation, addSecurityPrice, addIexSecurity, getIexSecurityBySymbol, getSecurityWithLatestPrice, updateIexSecurity, updateSecurity } from "./interfaces";
import { IDatabase, IMain } from 'pg-promise';
export declare class Repository {
    private db;
    private readonly pgp;
    constructor(db: IDatabase<any>, pgp: IMain);
    upsertSecuritiesPrices: (securityPrices: addSecurityPrice[]) => Promise<void>;
    getUsExchangedListSecuritiesWithPricing: () => Promise<getSecurityWithLatestPrice[]>;
    getUSExchangeListedSecurities: () => Promise<getSecurityBySymbol[]>;
    getSecurities: () => Promise<getSecurityBySymbol[]>;
    addSecurities: (securities: addSecurity[]) => Promise<void>;
    updateSecurities: (securities: updateSecurity[]) => Promise<void>;
    addIexSecurities: (securities: addIexSecurity[]) => Promise<void>;
    updateIexSecurities: (securities: updateIexSecurity[]) => Promise<void>;
    getIexSecurities: () => Promise<getIexSecurityBySymbol[]>;
    getSecurityBySymbol: (symbol: string) => Promise<getSecurityBySymbol[]>;
    getSecuritiesBySymbols: (symbols: string[]) => Promise<getSecurityBySymbol[]>;
    addExchanges: (exchanges: addExchange[]) => Promise<void>;
    getExchanges: () => Promise<getExchange[]>;
    addSecuritiesPrices: (securitiesPrices: addSecurityPrice[]) => Promise<void>;
    upsertSecuritiesInformation: (securitiesInformation: upsertSecuritiesInformation[]) => Promise<void>;
    addUsExchangeHolidays: (holidays: addUSHoliday[]) => Promise<void>;
    getUsExchangeHolidays: () => Promise<getUSExchangeHoliday[]>;
    getCurrentAndFutureExchangeHolidays: () => Promise<getUSExchangeHoliday[]>;
    removeSecurityPricesAfter7Days: () => Promise<any>;
}
