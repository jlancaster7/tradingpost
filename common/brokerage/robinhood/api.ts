import fetch from 'node-fetch'
import {
    PhoenixAccount,
    Position,
    RefreshResponse,
    Account,
    Order,
    Portfolio,
    Instrument,
    RecentDayTrade, OptionOrder, OptionPosition, Dividend, AchTransfer, Sweep, Option
} from "./interfaces";

/**
 * TODO:
 *      - minerva.robinhood.com/history/transactions/ -- Dont know what this is... want to find out more (looks like a bill payment)
 *      - api.robinhood.com/crypto/orders/ -- get orders
 */

export class AuthError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export default class Api {
    _refreshToken: string;
    _accessToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
    }

    refreshToken = async (clientId: string, deviceToken: string): Promise<RefreshResponse> => {
        const payload = {
            grant_type: 'refresh_token',
            refresh_token: this._refreshToken,
            scope: 'internal',
            client_id: clientId,
            device_token: deviceToken,
        }

        const refreshResponse = await this._do<RefreshResponse>("https://api.robinhood.com/oauth2/token/", {
            method: "POST",
            body: JSON.stringify(payload)
        })

        this._refreshToken = refreshResponse.refresh_token;
        this._accessToken = refreshResponse.access_token;
        return refreshResponse
    }

    sweeps = async (params: {}, pageUrl?: string): Promise<[Sweep[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/accounts/sweeps/"), {});
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as Sweep[], nextUrl];
    }

    achTransfers = async (params: {}, pageUrl?: string): Promise<[AchTransfer[], string | null]> => {
        const url = this._buildUrl(new URL("https://cashier.robinhood.com/ach/transfers/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as AchTransfer[], nextUrl];
    }

    accounts = async (params: {}, pageUrl?: string): Promise<[Account[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/accounts/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        if (!('results' in response)) return [[], nextUrl];
        return [response['results'] as Account[], nextUrl]
    }

    orders = async (params: {}, pageUrl?: string): Promise<[Order[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/orders/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            }
        })

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as Order[], nextUrl];
    }

    optionPositions = async (params: {}, pageUrl?: string): Promise<[OptionPosition[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/options/positions/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as OptionPosition[], nextUrl];
    }

    optionOrders = async (params: {}, pageUrl?: string): Promise<[OptionOrder[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/options/orders/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as OptionOrder[], nextUrl];
    }

    dividends = async (params: {}, pageUrl?: string): Promise<[Dividend[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/dividends/"), params);
        const response = await this._do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            }
        });

        const nextUrl = response.next ? response.next as string : null;
        const results = response.results;
        return [results as Dividend[], nextUrl];
    }

    positions = async (params: {
        // nonzero = true: all open positions
        nonzero?: boolean
    }, pageUrl?: string): Promise<[Position[], string | null]> => {
        const url = this._buildUrl(new URL("https://api.robinhood.com/positions/"), params);
        const response = await this._do <Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this._accessToken}`
            },
        });

        const nextUrl = response.next ? response.next as string : null
        const results = response.results;
        return [results as Position[], nextUrl];
    }

    phoenixAccount = async (): Promise<PhoenixAccount> => {
        const url = new URL("https://phoenix.robinhood.com/accounts/unified");
        return this._do<PhoenixAccount>(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this._accessToken}`
            }
        });
    }

    portfolios = async (): Promise<Portfolio[]> => {
        const url = new URL("https://api.robinhood.com/portfolios/");

        const res = await this._do<Record<string, any>>(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
        })
        if (!('results' in res)) return [];
        return res['results'] as Portfolio[]
    }

    instrument = async (instrumentId: string): Promise<Instrument> => {
        const url = new URL(`https://api.robinhood.com/instruments/${instrumentId}/`);

        return await this._do<Instrument>(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
        })
    }

    instruments = async (params: {
        symbol?: string
    }): Promise<Instrument | null> => {
        const url = this._buildUrl(new URL(`https://api.robinhood.com/instruments/`), params);

        const response = await this._do<Record<string, any>>(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
        })

        if (!('results' in response)) return null;
        if (response.results.length <= 0) return null;
        return response.results[0] as Instrument
    }

    option = async (optionId: string): Promise<Option> => {
        const url = new URL(`https://api.robinhood.com/options/instruments/${optionId}/`);

        return await this._do<Option>(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
        })
    }

    dayTrades = async (accountNumber: string): Promise<RecentDayTrade> => {
        const url = new URL(`https://api.robinhood.com/accounts/${accountNumber}/recent_day_trades/`)
        return await this._do<RecentDayTrade>(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this._accessToken}`
            }
        })
    }

    _do = async <T>(url: string, request: RequestInit): Promise<T> => {
        // @ts-ignore
        const res = await fetch(url, request)
        if (res.status === 401) throw new AuthError('');

        return await res.json() as T
    }

    _buildUrl = (url: URL, params: Record<string, any>): URL => {
        if (Object.keys(params).length > 0) {
            let p: Record<string, string> = {}
            Object.keys(params).forEach((param: string) => {
                // @ts-ignore
                const v = params[param];
                if (v === undefined || v === null) return;
                p[param] = v.toString();
            })
            url.search = new URLSearchParams(p).toString()
        }
        return url
    }
}