import { ICommentBasic, IUserList, IWatchlistList } from "../interfaces";
import { ensureServerExtensions, Extension } from "./index"
import { AccountGroupHPRsTable, TradingPostAccountGroupStats } from '../../../brokerage/interfaces'

export type UploadProfilePicBody = { image: string };

export default class User extends Extension {
    uploadProfilePic = this._makeFetch<UploadProfilePicBody, {}>("uploadProfilePic", this._defaultPostRequest)
    generateBrokerageLink = this._makeFetch<undefined, { link: string }>("generateBrokerageLink", this._defaultPostRequest)
    getBrokerageAccounts = this._makeFetch<undefined, { id: number, broker_name: string, account_number: string, user_id: string, hidden_for_deletion: boolean }[]>("getBrokerageAccounts", this._defaultPostRequest)
    initBrokerageAccounts = this._makeFetch<undefined, {}[]>("initBrokerageAccounts", this._defaultPostRequest)
    linkSocialAccount = this._makeFetch<{ callbackUrl: string, platform: string, code?: string, challenge?: string, platform_idenifier?: string }, string>("linkSocialAccount", this._defaultPostRequest)
    getComments = this._makeFetch<{ userId?: string }, ICommentBasic[]>("getComments", this._defaultPostRequest)
    getTrades = this._makePagedFetch<{ userId?: string }, { date: Date, type: string, quantity: number, price: number, fees: number, currency: string, security_id: number, option_id: number, option_info: any }[]>("getTrades", this._defaultPostRequest)
    getHoldings = this._makeFetch<{ userId?: string }, { security_id: number, symbol?: string, option_id: number, option_info: any, price: number, quantity: number, value: number, cost_basis: number, pnl: number, date: Date }[]>("getHoldings", this._defaultPostRequest)
    getWatchlists = this._makeFetch<{ userId: string }, IWatchlistList[]>("getWatchlists", this._defaultPostRequest)
    getReturns = this._makeFetch<{ userId?: string, startDate: Date, endDate: Date }, AccountGroupHPRsTable[]>("getReturns", this._defaultPostRequest)
    getPortfolio = this._makeFetch<{ userId?: string }, TradingPostAccountGroupStats>("getPortfolio", this._defaultPostRequest)
    search = this._makeFetch<{ term: string }, IUserList[]>("search", this._defaultPostRequest)
    validateUser = this._makeFetch<{ verificationToken: string }, {}>("validateUser", this._defaultPostRequest)
    //TODO: should thorttle this to prevent DDOS
    sendEmailValidation = this._makeFetch<undefined, {}>("sendEmailValidation", this._defaultPostRequest)
    setBlocked = this._makeFetch<{ userId: string, block: boolean }, { userId: string }>("setBlocked", this._defaultPostRequest)
    getBlocked = this._makeFetch<undefined, IUserList[]>("getBlocked", this._defaultPostRequest)
    //We can lock this down to prevent abuse if we need to
    testNotifcation = this._makeFetch<undefined, {}>("testNotifcation", this._defaultPostRequest)
    getPortfolioNotifications = this._makeFetch<{typeId: number}, {is_notification: boolean}>("getPortfolioNotifications", this._defaultPostRequest)
    togglePortfolioNotifications = this._makeFetch<{typeId: number, is_notification: boolean}, {}>("togglePortfolioNotifications", this._defaultPostRequest)
    discoveryOne = this._makeFetch<{page: number, limit: number}, (IUserList & {title: string, description: string})[]>("discoveryOne", this._defaultPostRequest)
    discoveryTwo = this._makeFetch<{page: number, limit: number}, (IUserList & {title: string, description: string})[]>("discoveryTwo", this._defaultPostRequest)
    discoveryThree = this._makeFetch<{page: number, limit: number}, IUserList[]>("discoveryThree", this._defaultPostRequest)
}
