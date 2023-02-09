import {default as RobinhoodTransformer} from "./transformer";
import {PortfolioSummaryService} from "../portfolio-summary";
import {
    Account, AchTransfer, Dividend,
    Instrument, Option, OptionEvent, OptionOrder, OptionPosition,
    Order,
    Position,
    RobinhoodAccount,
    RobinhoodAccountTable, RobinhoodInstrument, RobinhoodInstrumentTable, RobinhoodOption, RobinhoodOptionTable,
    RobinhoodPosition,
    RobinhoodTransaction, RobinhoodUser, RobinhoodUserTable, Sweep
} from "./interfaces";
import * as RHApi from "./api";
import {DateTime} from "luxon";
import {DirectBrokeragesType, ISummaryRepository, TradingPostInstitutionTable} from "../interfaces";
import {Repository as TransformerRepository} from "./transformer";

interface Repository {
    getInstitutionByName(name: string): Promise<TradingPostInstitutionTable | null>

    getRobinhoodUser(userId: string): Promise<RobinhoodUserTable | null>

    updateRobinhoodUser(user: RobinhoodUser): Promise<void>

    upsertRobinhoodAccounts(accs: RobinhoodAccount[]): Promise<void>

    upsertRobinhoodPositions(positions: RobinhoodPosition[]): void

    addRobinhoodInstrument(instrument: RobinhoodInstrument): Promise<number>

    getRobinhoodInstrumentsByExternalId(instrumentIds: string[]): Promise<RobinhoodInstrumentTable[]>

    getRobinhoodInstrumentBySymbol(symbol: string): Promise<RobinhoodInstrumentTable | null>

    getRobinhoodAccountsByRobinhoodUserId(userId: number): Promise<RobinhoodAccountTable[]>

    deleteRobinhoodAccountsPositions(accountIds: number[]): Promise<void>

    upsertRobinhoodTransactions(txs: RobinhoodTransaction[]): Promise<void>

    upsertRobinhoodOption(option: RobinhoodOption): Promise<number | null>

    getRobinhoodOptionsByExternalIds(externalIds: string[]): Promise<RobinhoodOptionTable[]>

    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>

    execTx(fn: (r: Repository & TransformerRepository & ISummaryRepository) => Promise<void>): Promise<void>
}

export class Service {
    private _transformer: RobinhoodTransformer;
    private _repo: Repository;
    private readonly _clientId: string;
    private _scope: string;
    private _expiresIn: number;
    private _portfolioSummaryService: PortfolioSummaryService;

    constructor(clientId: string, scope: string, expiresIn: number, repo: Repository, transformer: RobinhoodTransformer, portfolioSummarySrv: PortfolioSummaryService) {
        this._clientId = clientId;
        this._scope = scope;
        this._expiresIn = expiresIn;
        this._transformer = transformer;
        this._repo = repo;
        this._portfolioSummaryService = portfolioSummarySrv;
    }

    public remove = async (userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void> => {

    }

    public calculatePortfolioStatistics = async (userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void> => {
        return
    }

    public add = async (userId: string, brokerageUserId: string, date: DateTime, data?: any) => {
        const institution = await this._repo.getInstitutionByName("Robinhood");
        if (!institution) throw new Error("Robinhood institution is not defined");

        const newAccountIds = await this.accounts(userId, institution.id);
        await this._repo.addTradingPostAccountGroup(userId, 'default', newAccountIds, 10117);

        await this._repo.execTx(async (r) => {
            const robinhoodTransformer = new RobinhoodTransformer(r);
            const portSummaryService = new PortfolioSummaryService(r);
            const robinhoodSrv = new Service(this._clientId, this._scope, this._expiresIn, r, robinhoodTransformer, portSummaryService);

            await robinhoodSrv.positions(userId);
            await robinhoodSrv.transactions(userId);

            for (let i = 0; i < newAccountIds.length; i++) {
                await robinhoodSrv._transformer.computeHoldingsHistory(newAccountIds[i]);
            }

            await robinhoodSrv._portfolioSummaryService.computeAccountGroupSummary(userId);
        });
    }

    public update = async (userId: string, brokerageUserId: string, date: DateTime, data?: any) => {
        const institution = await this._repo.getInstitutionByName(DirectBrokeragesType.Robinhood);
        if (!institution) throw new Error("Robinhood institution is not defined");

        await this._repo.execTx(async (r) => {
            const robinhoodTransformer = new RobinhoodTransformer(r);
            const portSummaryService = new PortfolioSummaryService(r);
            const robinhoodSrv = new Service(this._clientId, this._scope, this._expiresIn, r, robinhoodTransformer, portSummaryService);

            await robinhoodSrv.accounts(userId, institution.id);
            await robinhoodSrv.positions(userId);
            await robinhoodSrv.transactions(userId);
            await robinhoodSrv._portfolioSummaryService.computeAccountGroupSummary(userId);
        });
    }

    private _apiAndUpdate = async <T>(user: RobinhoodUser, fnCall: any, params: any, nextUrl?: string, authUpdate?: boolean): Promise<T> => {
        try {
            return await fnCall(user.accessToken, params, nextUrl);
        } catch (e) {
            if (e instanceof RHApi.AuthError) {
                if (authUpdate) throw new Error("could not update authentication robinhood for account");
                // Do update and recall API
                const res = await RHApi.refreshToken(this._clientId, user.deviceToken, user.refreshToken as string);
                user.accessToken = res.access_token;
                user.refreshToken = res.refresh_token;
                await this._repo.updateRobinhoodUser(user);
                return this._apiAndUpdate(user, fnCall, params, nextUrl, true)
            }
            throw e
        }
    }

    public accounts = async (userId: string, institutionId: number): Promise<number[]> => {
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist");

        let [accounts, nextUrl] = await this._apiAndUpdate<[Account[], string | null]>(robinhoodUser, RHApi.accounts, {})
        let transformedAccounts = await this._transformAccounts(accounts, robinhoodUser.id);
        await this._repo.upsertRobinhoodAccounts(transformedAccounts);

        let allTransformedAccounts: RobinhoodAccount[] = [...transformedAccounts];
        while (nextUrl !== null) {
            [accounts, nextUrl] = await this._apiAndUpdate(robinhoodUser, RHApi.accounts, {}, nextUrl);
            if (accounts.length <= 0) break;

            transformedAccounts = await this._transformAccounts(accounts, robinhoodUser.id);
            await this._repo.upsertRobinhoodAccounts(transformedAccounts);
            allTransformedAccounts = [...allTransformedAccounts, ...transformedAccounts];
        }

        return await this._transformer.accounts(userId, institutionId, robinhoodUser, transformedAccounts);
    }

    public positions = async (userId: string) => {
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist")

        let instrumentsMap: Record<string, RobinhoodInstrumentTable> = {};
        let optionsMap: Record<string, RobinhoodOptionTable> = {};
        let accountMap: Record<string, RobinhoodAccountTable> = {};
        let internalAccountIds: Record<number, boolean> = {};

        (await this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => {
            accountMap[a.accountNumber] = a
            internalAccountIds[a.id] = true;
        });

        let allPositions: RobinhoodPosition[] = [];
        let positions = [];
        let positionsNextUrl = null;
        while (true) {
            [positions, positionsNextUrl] = await this._apiAndUpdate<[Position[], string | null]>(robinhoodUser, RHApi.positions, {}, positionsNextUrl !== null ? positionsNextUrl : undefined);
            (await this._repo.getRobinhoodInstrumentsByExternalId(positions.filter(p => p.instrument_id !== null).map(p => p.instrument_id as string))).forEach(res => instrumentsMap[res.externalId] = res);
            let transformedPositions = await this._transformPositions(robinhoodUser, positions, accountMap, instrumentsMap);
            allPositions = [...allPositions, ...transformedPositions];
            if (positionsNextUrl === null) break;
        }

        // Cash Positions
        let cashPositions = [];
        let cashNextUrl = null;
        const cashInstrument = await this._repo.getRobinhoodInstrumentBySymbol('USD:CUR');
        if (cashInstrument === null) throw new Error("no cash instrument found in robinhood table");

        while (true) {
            [cashPositions, cashNextUrl] = await this._apiAndUpdate<[Account[], string | null]>(robinhoodUser, RHApi.accounts, {}, cashNextUrl === null ? undefined : cashNextUrl);
            let transformedCashPositions = await this._transformCashPosition(cashPositions, accountMap, cashInstrument);
            allPositions = [...allPositions, ...transformedCashPositions];
            if (cashNextUrl === null) break;
        }

        // Options Positions
        let optionPositions = [];
        let optionNextUrl = null;
        while (true) {
            [optionPositions, optionNextUrl] = await this._apiAndUpdate<[OptionPosition[], string | null]>(robinhoodUser, RHApi.optionPositions, {}, optionNextUrl === null ? undefined : optionNextUrl);
            (await this._repo.getRobinhoodOptionsByExternalIds(optionPositions.filter(p => p.option_id !== null).map(p => p.option_id as string))).forEach(res => {
                optionsMap[res.externalId] = res;
            });
            let transformedPositions = await this._transformOptionPositions(robinhoodUser, optionPositions, accountMap, optionsMap);
            allPositions = [...allPositions, ...transformedPositions];
            if (optionNextUrl === null) break;
        }

        // Delete all current positions
        await this._repo.deleteRobinhoodAccountsPositions(Object.keys(internalAccountIds).map(a => parseInt(a)));

        // Upsert positions
        await this._repo.upsertRobinhoodPositions(allPositions);

        await this._transformer.positions(userId, allPositions);
    }

    public transactions = async (userId: string) => {
        // TODO: Set a date and if used, then stop filtering transactions if exceeds this date
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist")

        const cash = await this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
        if (!cash) throw new Error("could not find cash instrument for robinhood transactions");

        let instrumentsMap: Record<string, RobinhoodInstrumentTable> = {};
        let accountMap: Record<string, RobinhoodAccountTable> = {};
        let optionsMap: Record<string, RobinhoodOptionTable> = {};

        (await this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => accountMap[a.accountNumber] = a);

        let allTransactions: RobinhoodTransaction[] = [];

        let equityTxs: Order[] = [];
        let equityNextUrl: string | null = null;
        while (true) {
            [equityTxs, equityNextUrl] = await this._apiAndUpdate<[Order[], string | null]>(robinhoodUser, RHApi.orders, {}, equityNextUrl === null ? undefined : equityNextUrl);
            (await this._repo.getRobinhoodInstrumentsByExternalId(equityTxs.filter(p => p.instrument_id !== null).map(p => p.instrument_id as string))).forEach(res => instrumentsMap[res.externalId] = res);
            let transformedPositions = await this._transformTransactions(robinhoodUser, equityTxs, accountMap, instrumentsMap);
            allTransactions = [...allTransactions, ...transformedPositions];
            if (equityNextUrl === null) break;
        }

        let optionTxs: OptionOrder[] = [];
        let optionNextUrl: string | null = null;
        while (true) {
            [optionTxs, optionNextUrl] = await this._apiAndUpdate<[OptionOrder[], string | null]>(robinhoodUser, RHApi.optionOrders, {}, optionNextUrl === null ? undefined : optionNextUrl);
            let optionIds: Record<string, null> = {};
            optionTxs.forEach(ot => {
                if (!ot.legs || ot.legs.length <= 0) return;
                ot.legs.forEach(l => {
                    if (!l.option) return;
                    const oS = l.option.split("/");
                    optionIds[oS[oS.length - 2]] = null;
                })
            });
            (await this._repo.getRobinhoodOptionsByExternalIds(Object.keys(optionIds))).forEach(res => optionsMap[res.externalId] = res);
            let transformedOptions = await this._transformOptionOrders(robinhoodUser, optionTxs, accountMap, optionsMap);
            allTransactions = [...allTransactions, ...transformedOptions];
            if (optionNextUrl === null) break;
        }

        let dividendsTxs: Dividend[] = [];
        let dividendNextUrl: string | null = null;
        while (true) {
            [dividendsTxs, dividendNextUrl] = await this._apiAndUpdate<[Dividend[], string | null]>(robinhoodUser, RHApi.dividends, {}, dividendNextUrl === null ? undefined : dividendNextUrl);
            let transformedDividends = await this._transformDividends(dividendsTxs, accountMap, cash);
            allTransactions = [...allTransactions, ...transformedDividends];
            if (dividendNextUrl === null) break;
        }

        // Money Transfers
        let achTxs: AchTransfer[] = [];
        let achNextUrl: string | null = null;
        while (true) {
            [achTxs, achNextUrl] = await this._apiAndUpdate<[AchTransfer[], string | null]>(robinhoodUser, RHApi.achTransfers, {}, achNextUrl === null ? undefined : achNextUrl);
            let transformedAch = await this._transformAch(achTxs, accountMap, cash);
            allTransactions = [...allTransactions, ...transformedAch];
            if (achNextUrl === null) break;
        }

        // Sweeps(Interest Payments)
        let sweepTxs: Sweep[] = [];
        let sweepNextUrl: string | null = null;
        while (true) {
            [sweepTxs, sweepNextUrl] = await this._apiAndUpdate<[Sweep[], string | null]>(robinhoodUser, RHApi.sweeps, {}, sweepNextUrl === null ? undefined : sweepNextUrl);
            let transformedSweeps = await this._transformSweeps(sweepTxs, accountMap, cash);
            allTransactions = [...allTransactions, ...transformedSweeps];
            if (sweepNextUrl === null) break;
        }

        let optionEvents: OptionEvent[] = [];
        let optionEventsNextUrl: string | null = null;
        while (true) {
            [optionEvents, optionEventsNextUrl] = await this._apiAndUpdate<[OptionEvent[], string | null]>(robinhoodUser, RHApi.optionEvents, {}, optionEventsNextUrl === null ? undefined : optionEventsNextUrl);
            let transformedOptionsEvents = await this._transformOptionEvents(robinhoodUser, optionEvents, accountMap, optionsMap);
            allTransactions = [...allTransactions, ...transformedOptionsEvents];
            if (optionEventsNextUrl === null) break;
        }

        await this._repo.upsertRobinhoodTransactions(allTransactions);

        await this._transformer.transactions(userId, allTransactions);
    }

    private _transformDividends = async (dividendTxs: Dividend[], accountMap: Record<string, RobinhoodAccountTable>, cash: RobinhoodInstrumentTable): Promise<RobinhoodTransaction[]> => {
        let transformed: RobinhoodTransaction[] = [];
        for (let i = 0; i < dividendTxs.length; i++) {
            let d = dividendTxs[i];
            if (d.account === null) throw new Error("no account for dividends");
            const accountSplit = d.account.split('/');
            const accountNumber = accountSplit[accountSplit.length - 2];
            const internalAccount = accountMap[accountNumber];
            transformed.push({
                url: d.url,
                type: "dividend",
                executionsTimestamp: DateTime.fromFormat(d.payable_date as string, 'y-m-d'),
                extendedHours: null,
                trigger: null,
                externalCreatedAt: d.record_date,
                internalOptionId: null,
                rejectReason: null,
                stopPrice: null,
                side: null,
                refId: null,
                ratioQuantity: null,
                quantity: d.amount,
                externalId: d.id,
                processedQuantity: null,
                price: "1",
                positionUrl: null,
                positionEffect: null,
                optionLegId: null,
                pendingQuantity: null,
                lastTransactionAt: null,
                investmentScheduleId: null,
                internalInstrumentId: cash.id,
                internalAccountId: internalAccount.id,
                instrumentId: cash.externalId,
                fees: null,
                externalUpdatedAt: null,
                instrumentUrl: cash.url,
                executionsQuantity: parseFloat(d.amount as string),
                executionsSettlementDate: d.payable_date,
                executionsPrice: 1,
                executionsId: d.id,
                dollarBasedAmount: null,
                direction: null,
                cumulativeQuantity: null,
                chainSymbol: null,
                cancelUrl: null,
                canceledQuantity: null,
                averagePrice: null,
                state: d.state,
                accountNumber: accountNumber,
                chainId: null,
                cancel: null,
                accountUrl: internalAccount.url,
                cashDividendId: d.cash_dividend_id,
                achRelationship: null,
                expectedLandingDate: null,
                position: d.position,
                withholding: d.withholding,
                rate: d.rate,
                expectedLandingDateTime: null,
            })
        }
        return transformed;
    }

    private _transformSweeps = async (sweeps: Sweep[], accountMap: Record<string, RobinhoodAccountTable>, cash: RobinhoodInstrumentTable): Promise<RobinhoodTransaction[]> => {
        let transformedTxs: RobinhoodTransaction[] = [];
        for (let i = 0; i < sweeps.length; i++) {
            const s = sweeps[i];
            if (s.account_number === null) throw new Error("no account number found for sweep");
            const internalAccount = accountMap[s.account_number];
            transformedTxs.push({
                url: '',
                state: null,
                accountUrl: internalAccount.url,
                type: "interest",
                cancel: null,
                chainId: null,
                accountNumber: s.account_number,
                averagePrice: null,
                canceledQuantity: null,
                cancelUrl: null,
                chainSymbol: null,
                cumulativeQuantity: null,
                direction: s.direction,
                dollarBasedAmount: null,
                executionsId: s.id,
                executionsPrice: 1,
                executionsSettlementDate: s.pay_date,
                executionsQuantity: parseFloat(s.amount?.amount as string),
                instrumentUrl: cash.url,
                fees: null,
                externalUpdatedAt: null,
                instrumentId: cash.externalId,
                internalAccountId: internalAccount.id,
                internalInstrumentId: cash.id,
                investmentScheduleId: null,
                lastTransactionAt: null,
                pendingQuantity: null,
                optionLegId: null,
                positionEffect: null,
                positionUrl: null,
                price: "1",
                processedQuantity: null,
                externalId: s.id,
                quantity: s.amount ? s.amount.amount : null,
                ratioQuantity: null,
                refId: null,
                side: null,
                stopPrice: null,
                rejectReason: null,
                trigger: null,
                internalOptionId: null,
                externalCreatedAt: null,
                extendedHours: null,
                executionsTimestamp: DateTime.fromISO(s.pay_date as string),
                expectedLandingDateTime: null,
                rate: null,
                withholding: null,
                position: null,
                expectedLandingDate: null,
                achRelationship: null,
                cashDividendId: null,
            })
        }

        return transformedTxs
    }

    private _transformAch = async (achTxs: AchTransfer[], accountMap: Record<string, RobinhoodAccountTable>, cash: RobinhoodInstrumentTable): Promise<RobinhoodTransaction[]> => {
        let transformed: RobinhoodTransaction[] = [];
        for (let i = 0; i < achTxs.length; i++) {
            const ach = achTxs[i];

            const accountUrl = ach.account;
            if (!accountUrl) throw new Error("no account number found for account for ach");
            const accountUrlSplit = accountUrl.split("/");
            const accountNumber = accountUrlSplit[accountUrlSplit.length - 2];
            const internalAccount = accountMap[accountNumber];

            transformed.push({
                url: ach.url,
                type: "cash",
                accountUrl: ach.account,
                cancel: ach.cancel,
                state: ach.state,
                accountNumber: accountNumber,
                chainId: null,
                averagePrice: null,
                canceledQuantity: null,
                cancelUrl: ach.cancel,
                chainSymbol: null,
                cumulativeQuantity: null,
                direction: ach.direction,
                dollarBasedAmount: null,
                executionsId: ach.id,
                executionsPrice: 1,
                executionsQuantity: parseFloat(ach.amount as string),
                executionsTimestamp: DateTime.fromISO(ach.expected_landing_datetime as string),
                executionsSettlementDate: ach.expected_landing_date,
                fees: ach.fees,
                extendedHours: null,
                externalId: ach.id,
                instrumentUrl: cash.url,
                externalCreatedAt: ach.created_at,
                externalUpdatedAt: ach.updated_at,
                instrumentId: cash.externalId,
                internalAccountId: internalAccount.id,
                internalInstrumentId: cash.id,
                internalOptionId: null,
                investmentScheduleId: ach.investment_schedule_id,
                lastTransactionAt: null,
                optionLegId: null,
                pendingQuantity: null,
                positionEffect: null,
                positionUrl: null,
                price: "1",
                processedQuantity: null,
                quantity: ach.amount,
                ratioQuantity: null,
                refId: ach.ref_id,
                side: null,
                rejectReason: null,
                stopPrice: null,
                trigger: null,
                cashDividendId: null,
                achRelationship: ach.ach_relationship,
                expectedLandingDate: ach.expected_landing_date,
                position: null,
                withholding: null,
                rate: null,
                expectedLandingDateTime: ach.expected_landing_datetime
            })
        }

        return transformed;
    }

    private _addOption = async (robinhoodUser: RobinhoodUser, externalOptionId: string): Promise<RobinhoodOptionTable | null> => {
        const option = await this._apiAndUpdate<Option>(robinhoodUser, RHApi.option, {optionId: externalOptionId});
        const transformedOption = await this._transformOption(robinhoodUser, option);
        if (transformedOption === null) {
            console.warn("could not transform option")
            return null;
        }

        const optionId = await this._repo.upsertRobinhoodOption(transformedOption);
        if (optionId === null) {
            console.warn("could not add option to database")
            return null
        }

        return {
            ...transformedOption,
            id: optionId,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()
        }
    }

    private _transformOption = async (robinhoodUser: RobinhoodUser, option: Option): Promise<RobinhoodOption | null> => {
        if (option.chain_symbol === null) {
            console.warn("no chain symbol");
            return null;
        }

        let security = await this._repo.getRobinhoodInstrumentBySymbol(option.chain_symbol)
        if (security === null) {
            const newSecurity = await this._apiAndUpdate<Instrument | null>(robinhoodUser, RHApi.instruments, {symbol: option.chain_symbol});
            if (newSecurity === null) {
                console.warn("could not find new security for option chain symbol")
                return null;
            }

            const [newInstrument] = await this._transformInstrument([newSecurity]);
            const instrumentId = await this._repo.addRobinhoodInstrument(newInstrument);
            security = {
                ...newInstrument,
                id: instrumentId,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now()
            }
        }

        if (option.strike_price === null) throw new Error("no strike price set");
        if (option.expiration_date === null) throw new Error("no expiration date on option");
        if (option.type === null) throw new Error("no option type")

        return {
            url: option.url,
            type: option.type,
            chainId: option.chain_id,
            chainSymbol: option.chain_symbol,
            expirationDate: DateTime.fromFormat(option.expiration_date, "y-m-d"),
            externalCreatedAt: option.created_at,
            externalUpdatedAt: option.updated_at,
            externalId: option.id as string,
            internalInstrumentId: security.id,
            issueDate: option.issue_date,
            longStrategyCode: option.long_strategy_code,
            minTicksAboveTick: option.min_ticks ? option.min_ticks.above_tick : null,
            state: option.state,
            minTicksBelowTick: option.min_ticks ? option.min_ticks.below_tick : null,
            minTicksCutoffPrice: option.min_ticks ? option.min_ticks.cutoff_price : null,
            rhsTradability: option.rhs_tradability,
            selloutDateTime: option.sellout_datetime,
            shortStrategyCode: option.short_strategy_code,
            strikePrice: parseFloat(option.strike_price),
            tradability: option.tradability,
        }
    }

    private _addInstrument = async (robinhoodUser: RobinhoodUser, externalInstrumentId: string): Promise<RobinhoodInstrumentTable> => {
        const instrument = await this._apiAndUpdate<Instrument>(robinhoodUser, RHApi.instrument, {instrumentId: externalInstrumentId});
        const [transformedInstrument] = await this._transformInstrument([instrument]);

        const instrumentId = await this._repo.addRobinhoodInstrument(transformedInstrument);
        return {
            ...transformedInstrument,
            id: instrumentId,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()
        }
    }

    private _transformAccounts = async (accs: Account[], userId: number): Promise<RobinhoodAccount[]> => {
        return accs.map(a => {
            let x: RobinhoodAccount = {
                url: a.url,
                withdrawlHalted: a.withdrawal_halted,
                userUrl: a.user,
                unsettledFunds: a.unsettled_funds,
                unsettledDebit: a.unsettled_debit,
                unclearedDeposits: a.uncleared_deposits,
                smaHeldForOrders: a.sma_held_for_orders,
                portfolioCash: a.portfolio_cash,
                sma: a.sma,
                onbp: a.onbp,
                onlyPositionClosingTrades: a.only_position_closing_trades,
                maxAchEarlyAccessAmount: a.max_ach_early_access_amount,
                externalUpdatedAt: a.updated_at,
                externalCreatedAt: a.created_at,
                depositHalted: a.deposit_halted,
                type: a.type,
                deactivated: a.deactivated,
                cryptoBuyingPower: a.crypto_buying_power,
                cashHeldForOrders: a.cash_held_for_orders,
                cashBalances: a.cash_balances,
                cash: a.cash,
                cashAvailableForWithdrawl: a.cash_available_for_withdrawal,
                canDowngradeToCashUrl: a.can_downgrade_to_cash,
                buyingPower: a.buying_power,
                brokerageAccountType: a.brokerage_account_type,
                userId: userId,
                accountNumber: a.account_number as string,
                amountEligibleForDepositCancellation: a.amount_eligible_for_deposit_cancellation,
            }
            return x;
        })
    }

    private _transformInstrument = async (is: Instrument[]): Promise<RobinhoodInstrument[]> => {
        return is.map(i => {
            let x: RobinhoodInstrument = {
                externalId: i.id as string,
                allDayTradability: i.all_day_tradability,
                internalHaltSource: i.internal_halt_source,
                internalHaltEndTime: i.internal_halt_end_time,
                internalHaltStartTime: i.internal_halt_start_time,
                internalHaltSessions: i.internal_halt_sessions,
                internalHaltDetails: i.internal_halt_details,
                internalHaltReason: i.internal_halt_reason,
                isTest: i.is_test,
                isSpac: i.is_spac,
                type: i.type,
                extendedHoursFractionalTradability: i.extended_hours_fractional_tradability,
                ipoAccessSupportsDsp: i.ipo_access_supports_dsp,
                ipoRoadshowUrl: i.ipo_roadshow_url,
                ipoS1Url: i.ipo_s1_url,
                ipoAccessCobDeadline: i.ipo_access_cob_deadline,
                ipoAccessStatus: i.ipo_access_status,
                defaultCollarFraction: i.default_collar_fraction,
                fractionalTradability: i.fractional_tradability,
                rhsTradability: i.rhs_tradability,
                tradeableChainId: i.tradeable_chain_id,
                minTickSize: i.min_tick_size,
                listDate: i.list_date,
                dayTradeRatio: i.day_trade_ratio,
                country: i.country,
                maintenanceRatio: i.maintenance_ratio,
                marginInitialRatio: i.margin_initial_ratio,
                bloombergUnique: i.bloomberg_unique,
                tradability: i.tradability,
                tradeable: i.tradeable,
                name: i.name,
                marketUrl: i.market,
                state: i.state,
                splitsUrl: i.splits,
                symbol: i.symbol as string,
                fundamentalsUrl: i.fundamentals,
                quoteUrl: i.quote,
                url: i.url,
            }
            return x;
        });
    }

    private _transformCashPosition = async (cashPositions: Account[], accountMap: Record<string, RobinhoodAccountTable>, cashInstrument: RobinhoodInstrumentTable): Promise<RobinhoodPosition[]> => {
        let transformedPositions: RobinhoodPosition[] = [];
        for (let i = 0; i < cashPositions.length; i++) {
            const cp = cashPositions[i];
            if (cp.account_number === null) {
                console.warn("account number for cash is null");
                continue;
            }

            let internalAccount = accountMap[cp.account_number];
            if (internalAccount === null) {
                console.warn("could not find internal account for cash position");
                continue;
            }

            transformedPositions.push({
                quantity: cp.cash as string,
                url: cashInstrument.url as string,
                type: 'cash',
                externalId: null,
                externalOptionId: null,
                chainSymbol: null,
                internalOptionId: null,
                chainId: null,
                averagePrice: "1",
                intradayAverageOpenPrice: null,
                pendingAssignmentQuantity: null,
                pendingBuyQuantity: null,
                pendingExcerciseQuantity: null,
                pendingExpirationQuantity: null,
                pendingExpiredQuantity: null,
                pendingSellQuantity: null,
                tradeValueMultiplier: null,
                accountNumber: cp.account_number,
                accountUrl: cp.url,
                averageBuyPrice: null,
                avgCostAffected: null,
                avgCostAffectedReason: null,
                externalCreatedAt: null,
                externalUpdatedAt: null,
                instrumentId: null,
                instrumentUrl: null,
                internalAccountId: internalAccount.id,
                internalInstrumentId: cashInstrument.id,
                intradayAverageBuyPrice: null,
                intradayQuantity: null,
                ipoAllocatedQuantity: null,
                ipoDspAllocatedQuantity: null,
                isPrimaryAccount: cp.is_pinnacle_account !== null,
                pendingAverageBuyPrice: null,
                sharesAvailableForExercise: null,
                sharesHeldForBuys: null,
                sharesHeldForSells: null,
                sharesHeldForStockGrants: null
            })
        }

        return transformedPositions;
    }

    private _transformOptionPositions = async (robinhoodUser: RobinhoodUser, optionPosition: OptionPosition[], accountMap: Record<string, RobinhoodAccountTable>, optionMap: Record<string, RobinhoodOptionTable>): Promise<RobinhoodPosition[]> => {
        let transformedOptions: RobinhoodPosition[] = [];
        for (let i = 0; i < optionPosition.length; i++) {
            const op = optionPosition[i];

            if (op.quantity === null || parseFloat(op.quantity) === 0) {
                continue
            }

            if (op.account_number === null) {
                console.warn("account number is null");
                continue
            }

            if (op.option_id === null) {
                console.warn("option id is null")
                continue
            }

            let internalAccount = accountMap[op.account_number]
            if (internalAccount === null) {
                console.warn("account number not found")
                continue;
            }

            if (parseFloat(op.quantity) === 0) continue;

            if (!(op.option_id in optionMap)) {
                const newOption = await this._addOption(robinhoodUser, op.option_id);
                if (newOption === null) {
                    console.warn("could not add option")
                    continue;
                }

                optionMap[newOption.externalId] = newOption;
            }

            let internalOption = optionMap[op.option_id];
            transformedOptions.push({
                url: internalOption.url as string,
                sharesHeldForStockGrants: null,
                sharesHeldForSells: null,
                sharesHeldForBuys: null,
                quantity: op.quantity,
                externalId: op.id,
                externalOptionId: op.option_id,
                sharesAvailableForExercise: null,
                pendingAverageBuyPrice: null,
                isPrimaryAccount: null,
                ipoDspAllocatedQuantity: null,
                ipoAllocatedQuantity: null,
                intradayQuantity: op.intraday_quantity,
                intradayAverageBuyPrice: op.intraday_average_open_price,
                internalInstrumentId: internalOption.internalInstrumentId,
                type: op.type,
                internalAccountId: internalAccount.id,
                instrumentUrl: null,
                instrumentId: null,
                externalUpdatedAt: op.updated_at,
                externalCreatedAt: op.created_at,
                avgCostAffectedReason: null,
                chainId: op.chain_id,
                chainSymbol: op.chain_symbol,
                avgCostAffected: null,
                averageBuyPrice: null,
                accountUrl: op.account,
                internalOptionId: internalOption.id,
                accountNumber: op.account_number,
                averagePrice: op.average_price || "1",
                intradayAverageOpenPrice: op.intraday_average_open_price,
                pendingAssignmentQuantity: op.pending_assignment_quantity,
                pendingBuyQuantity: op.pending_buy_quantity,
                pendingExcerciseQuantity: op.pending_excercise_quantity,
                pendingExpirationQuantity: op.pending_expiration_quantity,
                pendingExpiredQuantity: op.pending_expired_quantity,
                pendingSellQuantity: op.pending_sell_quantity,
                tradeValueMultiplier: op.trade_value_multiplier,
            })
        }

        return transformedOptions;
    }

    private _transformOptionEvents = async (robinhoodUser: RobinhoodUser, optionEvents: OptionEvent[], accountMap: Record<string, RobinhoodAccountTable>, optionMap: Record<string, RobinhoodOptionTable>): Promise<RobinhoodTransaction[]> => {
        let transformedTxs: RobinhoodTransaction[] = [];
        for (let i = 0; i < optionEvents.length; i++) {
            let oe = optionEvents[i];
            if (oe.account_number === null) {
                console.warn("no account number for option")
                continue
            }

            const internalAccount = accountMap[oe.account_number];

            const optionSplit: string[] = oe.option.split("/");
            const optionNumber = optionSplit[optionSplit.length - 2];


            if (!(optionNumber in optionMap)) {
                const newOption = await this._addOption(robinhoodUser, optionNumber);
                if (newOption === null) {
                    console.warn("could not add option")
                    continue;
                }

                optionMap[newOption.externalId] = newOption;
            }

            const internalOption = optionMap[optionNumber];
            const expiredTimestamp = DateTime.fromISO(oe.created_at);
            transformedTxs.push({
                url: oe.option,
                executionsTimestamp: expiredTimestamp,
                extendedHours: null,
                externalCreatedAt: oe.created_at,
                trigger: null,
                internalOptionId: internalOption.id,
                rejectReason: null,
                stopPrice: null,
                side: oe.direction,
                refId: oe.source_ref_id,
                ratioQuantity: null,
                quantity: oe.quantity,
                externalId: oe.id,
                processedQuantity: null,
                price: oe.underlying_price,
                positionUrl: oe.position,
                positionEffect: null,
                optionLegId: null,
                pendingQuantity: null,
                lastTransactionAt: null,
                investmentScheduleId: null,
                internalInstrumentId: internalOption.internalInstrumentId,
                type: oe.type,
                internalAccountId: internalAccount.id,
                instrumentId: null,
                fees: null,
                externalUpdatedAt: oe.updated_at,
                instrumentUrl: null,
                executionsSettlementDate: oe.event_date,
                executionsQuantity: parseFloat(oe.quantity),
                executionsPrice: parseFloat(oe.underlying_price),
                executionsId: oe.id,
                dollarBasedAmount: null,
                direction: oe.direction,
                cumulativeQuantity: oe.quantity,
                chainSymbol: internalOption.chainSymbol,
                cancelUrl: null,
                canceledQuantity: null,
                averagePrice: null,
                chainId: internalOption.chainId,
                accountNumber: oe.account_number,
                state: oe.state,
                cancel: null,
                accountUrl: internalAccount.url,
                rate: null,
                cashDividendId: null,
                expectedLandingDateTime: null,
                achRelationship: null,
                expectedLandingDate: null,
                position: oe.position,
                withholding: null,
            })
        }

        return transformedTxs;
    }

    private _transformOptionOrders = async (robinhoodUser: RobinhoodUser, optionOrders: OptionOrder[], accountMap: Record<string, RobinhoodAccountTable>, optionMap: Record<string, RobinhoodOptionTable>): Promise<RobinhoodTransaction[]> => {
        let transformedTxs: RobinhoodTransaction[] = [];
        for (let i = 0; i < optionOrders.length; i++) {
            let oo = optionOrders[i];
            if (oo.account_number === null) {
                console.warn("no account number for option")
                continue
            }

            if (oo.legs === null || oo.legs.length === 0) {
                console.warn("no legs for option")
                continue
            }

            if (oo.quantity === null || parseFloat(oo.quantity) === 0) continue;

            const internalAccount = accountMap[oo.account_number];
            for (let j = 0; j < oo.legs.length; j++) {
                const leg = oo.legs[j];
                if (leg.option === null) {
                    console.warn("could not find option")
                    continue
                }

                if (leg.executions === null || leg.executions.length <= 0) continue

                const optionSplit: string[] = leg.option.split("/");
                const optionNumber = optionSplit[optionSplit.length - 2];

                if (!(optionNumber in optionMap)) {
                    const newOption = await this._addOption(robinhoodUser, optionNumber);
                    if (newOption === null) {
                        console.warn("could not add option")
                        continue;
                    }

                    optionMap[newOption.externalId] = newOption;
                }

                const internalOption = optionMap[optionNumber];
                for (let k = 0; k < leg.executions.length; k++) {
                    const execution = leg.executions[k];
                    if (execution.timestamp === null) throw new Error("execution timestamp missing");
                    const executionTimestamp = DateTime.fromISO(execution.timestamp)
                    transformedTxs.push({
                        url: leg.option,
                        executionsTimestamp: executionTimestamp,
                        extendedHours: null,
                        externalCreatedAt: '',
                        trigger: oo.trigger,
                        internalOptionId: internalOption.id,
                        rejectReason: null,
                        stopPrice: oo.stop_price,
                        side: leg.side,
                        refId: oo.ref_id,
                        ratioQuantity: leg.ratio_quantity,
                        quantity: oo.quantity,
                        externalId: oo.id,
                        processedQuantity: oo.processed_quantity,
                        price: oo.price,
                        positionUrl: null,
                        positionEffect: leg.position_effect,
                        optionLegId: leg.id,
                        pendingQuantity: oo.pending_quantity,
                        lastTransactionAt: null,
                        investmentScheduleId: null,
                        internalInstrumentId: internalOption.internalInstrumentId,
                        type: oo.type,
                        internalAccountId: internalAccount.id,
                        instrumentId: null,
                        fees: null,
                        externalUpdatedAt: oo.updated_at,
                        instrumentUrl: null,
                        executionsSettlementDate: execution.settlement_date,
                        executionsQuantity: parseFloat(execution.quantity as string),
                        executionsPrice: parseFloat(execution.price as string),
                        executionsId: execution.id,
                        dollarBasedAmount: null,
                        direction: oo.direction,
                        cumulativeQuantity: null,
                        chainSymbol: oo.chain_symbol,
                        cancelUrl: oo.cancel_url,
                        canceledQuantity: oo.canceled_quantity,
                        averagePrice: null,
                        chainId: oo.chain_id,
                        accountNumber: oo.account_number,
                        state: oo.state,
                        cancel: oo.cancel_url,
                        accountUrl: internalAccount.url,
                        rate: null,
                        cashDividendId: null,
                        expectedLandingDateTime: null,
                        achRelationship: null,
                        expectedLandingDate: null,
                        position: null,
                        withholding: null,
                    })
                }
            }
        }

        return transformedTxs
    }

    private _transformPositions = async (robinhoodUser: RobinhoodUser, positions: Position[], accountMap: Record<string, RobinhoodAccountTable>, instrumentMap: Record<string, RobinhoodInstrumentTable>): Promise<RobinhoodPosition[]> => {
        let transformedPositions: RobinhoodPosition[] = [];
        for (let i = 0; i < positions.length; i++) {
            const p = positions[i];
            if (p.account_number === null) {
                console.warn("account number is null")
                continue
            }

            if (p.instrument_id === null) {
                console.warn("instrument id is null")
                continue
            }

            if (p.quantity === null || parseFloat(p.quantity) === 0) continue;

            let internalAccount = accountMap[p.account_number];

            if (!(p.instrument_id in instrumentMap)) {
                const instrument = await this._addInstrument(robinhoodUser, p.instrument_id);
                instrumentMap[instrument.externalId] = instrument;
            }

            let internalInstrument = instrumentMap[p.instrument_id];
            transformedPositions.push({
                internalAccountId: internalAccount.id,
                internalInstrumentId: internalInstrument.id,
                url: p.url ? p.url : '',
                accountNumber: p.account_number,
                accountUrl: p.account,
                averageBuyPrice: p.average_buy_price,
                avgCostAffected: p.avg_cost_affected,
                avgCostAffectedReason: p.avg_cost_affected_reason,
                externalCreatedAt: p.created_at,
                externalUpdatedAt: p.updated_at,
                instrumentId: p.instrument_id,
                instrumentUrl: p.instrument,
                intradayAverageBuyPrice: p.intraday_average_buy_price,
                intradayQuantity: p.intraday_quantity,
                ipoAllocatedQuantity: p.ipo_allocated_quantity,
                ipoDspAllocatedQuantity: p.ipo_dsp_allocated_quantity,
                isPrimaryAccount: p.is_primary_account,
                pendingAverageBuyPrice: p.pending_average_buy_price,
                quantity: p.quantity || "0",
                sharesAvailableForExercise: p.shares_available_for_exercise,
                sharesHeldForBuys: p.shares_held_for_buys,
                sharesHeldForSells: p.shares_held_for_sells,
                sharesHeldForStockGrants: p.shares_held_for_stock_grants,
                tradeValueMultiplier: null,
                pendingSellQuantity: null,
                pendingExpiredQuantity: null,
                pendingExpirationQuantity: null,
                pendingExcerciseQuantity: null,
                pendingBuyQuantity: null,
                pendingAssignmentQuantity: null,
                intradayAverageOpenPrice: null,
                chainId: null,
                averagePrice: p.average_buy_price || "1",
                internalOptionId: null,
                chainSymbol: null,
                type: null,
                externalOptionId: null,
                externalId: null,
            });
        }

        return transformedPositions
    }

    private _transformTransactions = async (robinhoodUser: RobinhoodUser, transactions: Order[], accountMap: Record<string, RobinhoodAccountTable>, instrumentMap: Record<string, RobinhoodInstrumentTable>): Promise<RobinhoodTransaction[]> => {
        let transformedTxs: RobinhoodTransaction[] = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.account === null) {
                console.warn("no account url");
                continue
            }

            if (tx.instrument_id === null) {
                console.warn("no instrument id");
                continue
            }

            if (tx.quantity === null || parseFloat(tx.quantity) === 0) continue;

            const accountUrlSplit = tx.account.split("/");
            const accountNumber = accountUrlSplit[accountUrlSplit.length - 2];
            let internalAccount = accountMap[accountNumber];
            if (!internalAccount) throw new Error("no internal account for account id: " + tx.account)

            if (!(tx.instrument_id in instrumentMap)) {
                const instrument = await this._addInstrument(robinhoodUser, tx.instrument_id);
                instrumentMap[instrument.externalId] = instrument;
            }

            let internalInstrument = instrumentMap[tx.instrument_id];
            if (tx.executions === null) continue;

            for (let j = 0; j < tx.executions.length; j++) {
                const ex = tx.executions[j];
                if (ex.timestamp === null) throw new Error("no timestamp for execution");

                const executionsTimestamp = DateTime.fromISO(ex.timestamp);
                transformedTxs.push({
                    instrumentId: tx.instrument,
                    accountUrl: tx.account,
                    url: tx.url,
                    type: tx.type,
                    averagePrice: tx.average_price,
                    cancel: tx.cancel,
                    state: tx.state,
                    cumulativeQuantity: tx.cumulative_quantity,
                    dollarBasedAmount: tx.dollar_based_amount,
                    internalInstrumentId: internalInstrument.id,
                    executionsId: ex.id,
                    executionsPrice: parseFloat(ex.price as string),
                    executionsQuantity: parseFloat(ex.quantity as string),
                    externalId: tx.id,
                    executionsSettlementDate: ex.settlement_date,
                    executionsTimestamp: executionsTimestamp,
                    extendedHours: tx.extended_hours,
                    externalCreatedAt: tx.created_at,
                    externalUpdatedAt: tx.updated_at,
                    fees: tx.fees ? (parseFloat(tx.fees) / tx.executions.length).toString() : null,
                    instrumentUrl: tx.instrument,
                    internalAccountId: internalAccount.id,
                    rejectReason: tx.reject_reason,
                    investmentScheduleId: tx.investment_schedule_id,
                    lastTransactionAt: tx.last_transaction_at,
                    price: tx.price,
                    quantity: tx.quantity,
                    positionUrl: tx.position,
                    refId: tx.ref_id,
                    side: tx.side,
                    stopPrice: tx.stop_price,
                    trigger: tx.trigger,
                    internalOptionId: null,
                    accountNumber: accountNumber,
                    chainId: null,
                    canceledQuantity: null,
                    cancelUrl: null,
                    chainSymbol: null,
                    direction: null,
                    optionLegId: null,
                    pendingQuantity: null,
                    positionEffect: null,
                    processedQuantity: null,
                    ratioQuantity: null,
                    rate: null,
                    expectedLandingDateTime: null,
                    withholding: null,
                    position: tx.position,
                    expectedLandingDate: null,
                    achRelationship: null,
                    cashDividendId: null,
                })
            }
        }
        return transformedTxs;
    }
}
