import { PhoenixAccount, Position, RefreshResponse, Account, Order, Portfolio, Instrument, RecentDayTrade, OptionOrder, OptionPosition, Dividend, AchTransfer, Sweep, Option, OptionEvent } from "./interfaces";
/**
 * TODO:
 *      - minerva.robinhood.com/history/transactions/ -- Dont know what this is... want to find out more (looks like a bill payment)
 *      - api.robinhood.com/crypto/orders/ -- get orders
 */
export declare class AuthError extends Error {
    constructor(msg: string);
}
export declare const refreshToken: (clientId: string, deviceToken: string, _refreshToken: string) => Promise<RefreshResponse>;
export declare const sweeps: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[Sweep[], string | null]>;
export declare const achTransfers: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[AchTransfer[], string | null]>;
export declare const accounts: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[Account[], string | null]>;
export declare const orders: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[Order[], string | null]>;
export declare const optionPositions: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[OptionPosition[], string | null]>;
export declare const optionOrders: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[OptionOrder[], string | null]>;
export declare const optionEvents: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[OptionEvent[], string | null]>;
export declare const dividends: (_accessToken: string, params: {}, pageUrl?: string) => Promise<[Dividend[], string | null]>;
export declare const positions: (_accessToken: string, params: {
    nonzero?: boolean;
}, pageUrl?: string) => Promise<[Position[], string | null]>;
export declare const phoenixAccount: (_accessToken: string) => Promise<PhoenixAccount>;
export declare const portfolios: (_accessToken: string) => Promise<Portfolio[]>;
export declare const instrument: (_accessToken: string, params: {
    instrumentId: string;
}) => Promise<Instrument>;
export declare const instruments: (_accessToken: string, params: {
    symbol?: string;
}) => Promise<Instrument | null>;
export declare const option: (_accessToken: string, params: {
    optionId: string;
}) => Promise<Option>;
export declare const dayTrades: (_accessToken: string, accountNumber: string) => Promise<RecentDayTrade>;
