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
exports.__esModule = true;
exports.WatchlistScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddButton_1 = require("../components/AddButton");
var Section_1 = require("../components/Section");
var Table_1 = require("../components/Table");
var style_1 = require("../style");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var WatchlistViewerScreen_1 = require("./WatchlistViewerScreen");
var WatchlistSection_1 = require("../components/WatchlistSection");
var WatchlistScreen = function (props) {
    var _a = (0, react_1.useState)(), watchlists = _a[0], setWatchlists = _a[1];
    var _b = (0, react_1.useState)(), quickWatchlist = _b[0], setQuickWatchlist = _b[1];
    var toast = (0, react_native_toast_notifications_1.useToast)(); //const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var lists, _a, ex_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, api_1.Api.Watchlist.extensions.getAllWatchlists()];
                    case 1:
                        lists = _b.sent();
                        if (!lists.quick.id) return [3 /*break*/, 3];
                        _a = setQuickWatchlist;
                        return [4 /*yield*/, api_1.Api.Watchlist.get(lists.quick.id)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]);
                        return [3 /*break*/, 4];
                    case 3:
                        setQuickWatchlist({
                            id: 0,
                            items: [],
                            name: "",
                            saved_by_count: 0,
                            type: "primary",
                            user: [],
                            is_saved: false
                        });
                        _b.label = 4;
                    case 4:
                        setWatchlists(lists);
                        return [3 /*break*/, 6];
                    case 5:
                        ex_1 = _b.sent();
                        toast.show(ex_1.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var watchlistItemColumns = (0, WatchlistViewerScreen_1.useWatchlistItemColumns)(true).columns;
    return <react_native_1.View style={[style_1.paddView]}>
        <react_native_1.ScrollView>
            
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
exports.WatchlistScreen = WatchlistScreen;
