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

const _do = async <T>(url: string, request: RequestInit): Promise<T> => {
    // @ts-ignore
    const res = await fetch(url, request)
    if (res.status === 401) throw new AuthError('');

    return await res.json() as T
}

const _buildUrl = (url: URL, params: Record<string, any>): URL => {
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

export const refreshToken = async (clientId: string, deviceToken: string, _refreshToken: string,): Promise<RefreshResponse> => {
    const payload = {
        grant_type: 'refresh_token',
        refresh_token: _refreshToken,
        scope: 'internal',
        client_id: clientId,
        device_token: deviceToken,
    }

    return await _do<RefreshResponse>("https://api.robinhood.com/oauth2/token/", {
        method: "POST",
        body: JSON.stringify(payload)
    })
}

export const sweeps = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[Sweep[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/accounts/sweeps/"), {});
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as Sweep[], nextUrl];
}

export const achTransfers = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[AchTransfer[], string | null]> => {
    const url = _buildUrl(new URL("https://cashier.robinhood.com/ach/transfers/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as AchTransfer[], nextUrl];
}

export const accounts = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[Account[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/accounts/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    if (!('results' in response)) return [[], nextUrl];
    return [response['results'] as Account[], nextUrl]
}

export const orders = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[Order[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/orders/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    })

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as Order[], nextUrl];
}

export const optionPositions = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[OptionPosition[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/options/positions/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as OptionPosition[], nextUrl];
}

export const optionOrders = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[OptionOrder[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/options/orders/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as OptionOrder[], nextUrl];
}

export const dividends = async (_accessToken: string, params: {}, pageUrl?: string): Promise<[Dividend[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/dividends/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        }
    });

    const nextUrl = response.next ? response.next as string : null;
    const results = response.results;
    return [results as Dividend[], nextUrl];
}

export const positions = async (_accessToken: string, params: {
    // nonzero = true: all open positions
    nonzero?: boolean
}, pageUrl?: string): Promise<[Position[], string | null]> => {
    const url = _buildUrl(new URL("https://api.robinhood.com/positions/"), params);
    const response = await _do<Record<string, any>>(pageUrl ? pageUrl : url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        },
    });

    const nextUrl = response.next ? response.next as string : null
    const results = response.results;
    return [results as Position[], nextUrl];
}

export const phoenixAccount = async (_accessToken: string): Promise<PhoenixAccount> => {
    const url = new URL("https://phoenix.robinhood.com/accounts/unified");
    return _do<PhoenixAccount>(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        }
    });
}

export const portfolios = async (_accessToken: string): Promise<Portfolio[]> => {
    const url = new URL("https://api.robinhood.com/portfolios/");

    const res = await _do<Record<string, any>>(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    })
    if (!('results' in res)) return [];
    return res['results'] as Portfolio[]
}

export const instrument = async (_accessToken: string, params: { instrumentId: string }): Promise<Instrument> => {
    const url = new URL(`https://api.robinhood.com/instruments/${params.instrumentId}/`);

    return await _do<Instrument>(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    })
}

export const instruments = async (_accessToken: string, params: {
    symbol?: string
}): Promise<Instrument | null> => {
    const url = _buildUrl(new URL(`https://api.robinhood.com/instruments/`), params);

    const response = await _do<Record<string, any>>(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    })

    if (!('results' in response)) return null;
    if (response.results.length <= 0) return null;
    return response.results[0] as Instrument
}

export const option = async (_accessToken: string, params: { optionId: string },): Promise<Option> => {
    const url = new URL(`https://api.robinhood.com/options/instruments/${params.optionId}/`);

    return await _do<Option>(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${_accessToken}`
        },
    })
}

export const dayTrades = async (_accessToken: string, accountNumber: string): Promise<RecentDayTrade> => {
    const url = new URL(`https://api.robinhood.com/accounts/${accountNumber}/recent_day_trades/`)
    return await _do<RecentDayTrade>(url.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${_accessToken}`
        }
    })
}