"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.PortfolioScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddButton_1 = require("../components/AddButton");
var components_1 = require("@ui-kitten/components");
var Section_1 = require("../components/Section");
var Table_1 = require("../components/Table");
var style_1 = require("../style");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var WatchlistViewerScreen_1 = require("./WatchlistViewerScreen");
var misc_1 = require("../utils/misc");
var WatchlistSection_1 = require("../components/WatchlistSection");
var theme_light_json_1 = require("../theme-light.json");
var TableModalScreen_1 = require("./TableModalScreen");
var ButtonGroup_1 = require("../components/ButtonGroup");
var InteractiveGraph_1 = require("../components/InteractiveGraph");
var styles = {
    stateLabel: {
        color: theme_light_json_1["default"]["color-info-800"],
        textAlign: "center"
    },
    stateValue: {
        // color: AppColors.primary,
        textAlign: "center",
        marginBottom: style_1.sizes.rem0_5
    }
};
var periods = {
    "1D": 1,
    "1W": 5,
    "1M": 20,
    "3M": 60,
    "1Y": 252,
    "2Y": 504,
    "Max": 1000
};
var PortfolioScreen = function (props) {
    var _a = (0, react_1.useState)(), watchlists = _a[0], setWatchlists = _a[1];
    var _b = (0, react_1.useState)(), quickWatchlist = _b[0], setQuickWatchlist = _b[1];
    var toast = (0, react_native_toast_notifications_1.useToast)(); //const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    var _c = (0, react_1.useState)(), holdings = _c[0], setHoldings = _c[1];
    var _d = (0, react_1.useState)(), portfolio = _d[0], setPortfolio = _d[1];
    var _e = (0, react_1.useState)(), returns = _e[0], setReturns = _e[1];
    var _f = (0, react_1.useState)(), twReturns = _f[0], settwReturns = _f[1];
    var _g = (0, react_1.useState)("1Y"), portPeriod = _g[0], setPortPeriod = _g[1];
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, lists, holdings_1, portfolio_1, ex_1, _b, ex_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, Promise.all([
                                api_1.Api.Watchlist.extensions.getAllWatchlists(),
                                api_1.Api.User.extensions.getHoldings()
                            ])];
                    case 1:
                        _a = _c.sent(), lists = _a[0], holdings_1 = _a[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, api_1.Api.User.extensions.getPortfolio({})];
                    case 3:
                        portfolio_1 = _c.sent();
                        setPortfolio(portfolio_1);
                        return [3 /*break*/, 5];
                    case 4:
                        ex_1 = _c.sent();
                        console.error(ex_1);
                        return [3 /*break*/, 5];
                    case 5:
                        if (!lists.quick.id) return [3 /*break*/, 7];
                        _b = setQuickWatchlist;
                        return [4 /*yield*/, api_1.Api.Watchlist.get(lists.quick.id)];
                    case 6:
                        _b.apply(void 0, [_c.sent()]);
                        return [3 /*break*/, 8];
                    case 7:
                        setQuickWatchlist({
                            id: 0,
                            items: [],
                            name: "",
                            saved_by_count: 0,
                            type: "primary",
                            user: [],
                            is_saved: false
                        });
                        _c.label = 8;
                    case 8:
                        setWatchlists(lists);
                        //          setTrades(trades);
                        setHoldings(holdings_1);
                        return [3 /*break*/, 10];
                    case 9:
                        ex_2 = _c.sent();
                        toast.show(ex_2.message);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var today, returns_1, twr_1, day, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        today = new Date();
                        return [4 /*yield*/, api_1.Api.User.extensions.getReturns({
                                startDate: new Date(today.setDate(today.getDate() - 1001)),
                                endDate: new Date()
                            })];
                    case 1:
                        returns_1 = _a.sent();
                        setReturns(returns_1);
                        twr_1 = [];
                        day = new Date(String(returns_1.slice(returns_1.length - periods[portPeriod])[0].date));
                        twr_1.push({ x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1 });
                        //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
                        //twr[0].return = 1;
                        //const day = new Date(String(twr[0].date))
                        //twr[0].date = new Date(day.setDate(day.getDate() - 1));
                        returns_1 === null || returns_1 === void 0 ? void 0 : returns_1.slice(returns_1.length - periods[portPeriod]).forEach(function (r, i) {
                            twr_1.push({ x: new Date(String(r.date)).toUTCString(), y: twr_1[i].y * (1 + r["return"]) });
                            //twr.push(JSON.parse(JSON.stringify(r)));
                            //twr[i+1].return = twr[i].return * (1 + r.return);
                        });
                        settwReturns(twr_1);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    (0, react_1.useEffect)(function () {
        if (!returns) {
            return;
        }
        var twr = [];
        var day = new Date(String(returns.slice(returns.length - periods[portPeriod])[0].date));
        twr.push({ x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1 });
        //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
        //twr[0].return = 1;
        //const day = new Date(String(twr[0].date))
        //twr[0].date = new Date(day.setDate(day.getDate() - 1));
        returns === null || returns === void 0 ? void 0 : returns.slice(returns.length - periods[portPeriod]).forEach(function (r, i) {
            twr.push({ x: new Date(String(r.date)).toUTCString(), y: twr[i].y * (1 + r["return"]) });
            //twr.push(JSON.parse(JSON.stringify(r)));
            //twr[i+1].return = twr[i].return * (1 + r.return);
        });
        settwReturns(twr);
    }, [portPeriod]);
    var cummReturn = 0;
    if (twReturns)
        cummReturn = twReturns[twReturns.length - 1].y - 1;
    var watchlistItemColumns = (0, WatchlistViewerScreen_1.useWatchlistItemColumns)(true).columns;
    return <react_native_1.View style={[style_1.paddView]}>
        <react_native_1.ScrollView>
            <Section_1.ElevatedSection key={"portfolio"} title="Portfolio">
                <Section_1.Subsection title="Performance">
                    <react_native_1.View style={{ marginBottom: style_1.sizes.rem1 }}>
                        {/*<LineHolder data={twReturns} />*/}
                        <InteractiveGraph_1["default"] data={twReturns} period={portPeriod} performance={true}/>
                    </react_native_1.View>
                    <ButtonGroup_1.ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "2Y", "Max"].map(function (v) { return ({ label: v, value: v }); })} onValueChange={function (v) { return setPortPeriod(v); }} value={portPeriod}/>
                    <react_native_1.View style={{ borderColor: "#ccc", borderWidth: 1, backgroundColor: "#f5f5f5", padding: style_1.sizes.rem0_5 / 2 }}>
                        <react_native_1.View key={"returns"} style={{ flexDirection: "row" }}>
                            {[
            { title: "Total Return", value: (0, misc_1.toPercent2)(cummReturn) },
            { title: "Beta", value: (0, misc_1.toNumber2)((portfolio === null || portfolio === void 0 ? void 0 : portfolio.beta) || 0) },
            { title: "Sharpe Ratio", value: (0, misc_1.toPercent2)((portfolio === null || portfolio === void 0 ? void 0 : portfolio.sharpe) || 0) }
        ]
            .map(function (item, idx) {
            return <react_native_1.View key={"key_" + idx} style={style_1.flex}>
                                        <components_1.Text style={styles.stateLabel}>{item.title}</components_1.Text>
                                        <components_1.Text style={styles.stateValue}>{item.value}</components_1.Text>
                                    </react_native_1.View>;
        })}
                        </react_native_1.View>
                        <react_native_1.View key="exposures" style={{ flexDirection: "row" }}>
                            {[
            { title: "Long", value: (portfolio === null || portfolio === void 0 ? void 0 : portfolio.exposure.long) || 0 },
            { title: "Short", value: (portfolio === null || portfolio === void 0 ? void 0 : portfolio.exposure.short) || 0 },
            { title: "Gross", value: (portfolio === null || portfolio === void 0 ? void 0 : portfolio.exposure.gross) || 0 },
            { title: "Net", value: (portfolio === null || portfolio === void 0 ? void 0 : portfolio.exposure.net) || 0 }
        ]
            .map(function (item, idx) {
            return <react_native_1.View key={"key_" + idx} style={style_1.flex}>
                                        <components_1.Text style={styles.stateLabel}>{item.title}</components_1.Text>
                                        <components_1.Text style={styles.stateValue}>{(0, misc_1.toPercent)(item.value)}</components_1.Text>
                                    </react_native_1.View>;
        })}
                        </react_native_1.View>
                    </react_native_1.View>
                </Section_1.Subsection>
                <Section_1.Subsection key="holdings" title="Holdings">{<Table_1.Table data={holdings} columns={__spreadArray(__spreadArray([], (0, WatchlistViewerScreen_1.useMakeSecurityFields)(function (item) {
                return Number(item.security_id);
            }), true), [
                { alias: "# Shares", stringify: function (a, b, c) { return String((0, misc_1.toThousands)(c.quantity)); }, headerStyle: { overflow: 'visible' } },
                { alias: "Price", stringify: function (a, b, c) { return String((0, misc_1.toDollarsAndCents)(c.price)); } },
                { alias: "$ Value", stringify: function (a, b, c) { return String((0, misc_1.toDollars)(c.value)); } },
                { alias: "PnL", stringify: function (a, b, c) { return (0, misc_1.toDollars)(Number(c.value) - Number(c.cost_basis)); } }
            ], false)}/>}</Section_1.Subsection>
                <Section_1.Subsection key="trades" title="Trades">
                    <TableModalScreen_1.LimitedTable title="All Trades" maxPage={0} tableProps={{
            keyExtractor: function (item, idx) {
                return item ? "trade_" + idx : "empty";
            },
            data: (function (a, $page) { return __awaiter(void 0, void 0, void 0, function () {
                var newArr, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            newArr = a || [];
                            _b = (_a = newArr.push).apply;
                            _c = [newArr];
                            return [4 /*yield*/, api_1.Api.User.extensions.getTrades({ $page: $page, settings: {} })];
                        case 1:
                            _b.apply(_a, _c.concat([(_d.sent())]));
                            console.log(JSON.stringify(newArr));
                            return [2 /*return*/, newArr];
                    }
                });
            }); }),
            columns: __spreadArray(__spreadArray([], (0, WatchlistViewerScreen_1.useMakeSecurityFields)(function (item) {
                return Number(item.security_id);
            }), true), [
                { alias: "Date", stringify: function (a, b, c) { return new Date(Date.parse(String(c.date))).toLocaleDateString(); } },
                { alias: "# Shares", stringify: function (a, b, c) { return String((0, misc_1.toThousands)(c.quantity)); } },
                { alias: "Price", stringify: function (a, b, c) { return String((0, misc_1.toDollarsAndCents)(c.price)); } }
            ], false)
        }}/>
                </Section_1.Subsection>
            </Section_1.ElevatedSection>
            <Section_1.ElevatedSection key={"quick_watch"} title="Quick Watch" button={function (_p) {
            return (watchlists === null || watchlists === void 0 ? void 0 : watchlists.quick.id) ?
                <AddButton_1.EditButton {..._p} onPress={function () {
                        props.navigation.navigate("WatchlistEditor", {
                            watchlistId: watchlists === null || watchlists === void 0 ? void 0 : watchlists.quick.id
                        });
                    }}/> :
                <AddButton_1.AddButton {..._p} onPress={function () {
                        props.navigation.navigate("WatchlistEditor", {
                            watchlistId: -1
                        });
                    }}/>;
        }}>
                <Table_1.Table noDataMessage="No Companies" columns={watchlistItemColumns} data={quickWatchlist === null || quickWatchlist === void 0 ? void 0 : quickWatchlist.items}/>
            </Section_1.ElevatedSection>
            <WatchlistSection_1.WatchlistSection title="My Watchlists" key={"my_watchlist"} watchlists={watchlists === null || watchlists === void 0 ? void 0 : watchlists.created} showAddButton hideNoteOnEmpty/>
            <WatchlistSection_1.WatchlistSection title="Shared Watchlists" key={"shared_watchlist"} watchlists={watchlists === null || watchlists === void 0 ? void 0 : watchlists.saved} shared/>
            {/* <ElevatedSection key={"saved_watchlists"} title="Saved Watchlists">
            <Table
                noDataMessage="No saved watchlists"
                data={watchlists?.saved}
                rowPressed={(info) => {
                    props.navigation.navigate("Watchlist", {
                        watchlistId: info.id
                    })
                }}
                columns={[
                    
                    
                ]}

            />
        </ElevatedSection> */}
        </react_native_1.ScrollView>
    </react_native_1.View>;
};
exports.PortfolioScreen = PortfolioScreen;
