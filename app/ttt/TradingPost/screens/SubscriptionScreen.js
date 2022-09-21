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
exports.SubscriptionSettingsScreen = exports.SubscriptionScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var AddButton_1 = require("../components/AddButton");
var Picker_1 = require("../components/Picker");
var PrimaryButton_1 = require("../components/PrimaryButton");
var ProfileButton_1 = require("../components/ProfileButton");
var Section_1 = require("../components/Section");
var Table_1 = require("../components/Table");
var style_1 = require("../style");
var hooks_1 = require("../utils/hooks");
var SubscriptionScreen = function (props) {
    var _a = (0, react_1.useState)(0), index = _a[0], setIndex = _a[1];
    //const [] = useState<  >()
    //  useEffect(()=>{},[])
    var mySubscriptionsCall = api_1.Api.Subscriber.extensions.getBySubscriber, mySubscribersCall = api_1.Api.Subscriber.extensions.getByOwner, _b = (0, react_1.useState)(), subscriptions = _b[0], setSubscriptions = _b[1], _c = (0, react_1.useState)(), subscribers = _c[0], setSubscribers = _c[1];
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var subtionTask, suberTask, _a, subscriptions_1, subscribers_1, ex_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        subtionTask = mySubscriptionsCall();
                        suberTask = mySubscribersCall();
                        return [4 /*yield*/, Promise.all([subtionTask, suberTask])];
                    case 1:
                        _a = _b.sent(), subscriptions_1 = _a[0], subscribers_1 = _a[1];
                        setSubscriptions(subscriptions_1);
                        setSubscribers(subscribers_1);
                        return [3 /*break*/, 3];
                    case 2:
                        ex_1 = _b.sent();
                        console.error(ex_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    return <react_native_1.View style={style_1.paddView}><Section_1.ElevatedSection title="Manage Subscriptions" button={function (p) { return <AddButton_1.EditButton onPress={function () {
                props.navigation.navigate("SubscriptionSettings");
            }} {...p}/>; }}><components_1.TabView indicatorStyle={{
            marginTop: 26
        }} style={{ marginVertical: style_1.sizes.rem0_5 }} selectedIndex={index} onSelect={setIndex}>
            <components_1.Tab title="Subscriptions">
                <Table_1.Table rowPressed={function (r) {
            var _a;
            props.navigation.navigate("Profile", {
                userId: (_a = r.subscription) === null || _a === void 0 ? void 0 : _a[0].user_id
            });
        }} data={subscriptions} columns={[
            {
                headerStyle: {
                    height: 20,
                    width: 20,
                    flex: 0,
                    flexBasis: 22
                },
                alias: " ",
                field: function (item) {
                    var user = item.item.subscription[0].user[0];
                    return <ProfileButton_1.ProfileButton userId={user.id} size={20} profileUrl={user.profile_url || ""}/>;
                }
            },
            {
                alias: "Analyst",
                align: "left",
                field: "subscription",
                style: {
                    paddingLeft: 4
                },
                stringify: function (k) {
                    return '@' + k[0].user[0].handle;
                }
            },
            {
                alias: "Cost",
                align: "left",
                field: "subscription",
                stringify: function (k) {
                    return String(k[0].cost);
                }
            },
            {
                alias: "Since",
                field: "start_date",
                stringify: function (k) {
                    return String(k);
                }
            }
        ]}/>
            </components_1.Tab>
            <components_1.Tab title="Subscribers">
                <Table_1.Table rowPressed={function (r) {
            var _a;
            props.navigation.navigate("Profile", {
                userId: (_a = r.subscription) === null || _a === void 0 ? void 0 : _a[0].user_id
            });
        }} data={subscribers} columns={[
            {
                headerStyle: {
                    height: 20,
                    width: 20,
                    flex: 0,
                    flexBasis: 22
                },
                alias: " ",
                field: function (item) {
                    var user = item.item.user[0];
                    return <ProfileButton_1.ProfileButton userId={user.id} size={20} profileUrl={user.profile_url || ""}/>;
                }
            },
            {
                alias: "Subscriber",
                align: "left",
                field: "user",
                style: {
                    paddingLeft: 4
                },
                stringify: function (k) {
                    return '@' + k[0].handle;
                }
            },
            {
                headerStyle: {
                    height: 20,
                    width: 20,
                    flex: 0,
                    flexBasis: 22
                },
                alias: " ",
                field: function (item) {
                    var user = item.item.user[0];
                    return <ProfileButton_1.ProfileButton userId={user.id} size={20} profileUrl={user.profile_url || ""}/>;
                }
            },
            {
                alias: "Since",
                field: "start_date",
                stringify: function (k) {
                    return String(k);
                }
            }
        ]}/>

            </components_1.Tab>
        </components_1.TabView>
    </Section_1.ElevatedSection>
    </react_native_1.View>;
};
exports.SubscriptionScreen = SubscriptionScreen;
var SubscriptionSettingsScreen = function (props) {
    var _a;
    var call = api_1.Api.Subscription.extensions.getByUserId;
    var subscription = (0, hooks_1.useReadonlyEntity)(null);
    var toast = (0, react_native_toast_notifications_1.useToast)();
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, ex_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = (_a = subscription).resetData;
                        return [4 /*yield*/, call()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [3 /*break*/, 3];
                    case 2:
                        ex_2 = _c.sent();
                        toast.show(ex_2.message);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    return <react_native_1.View style={style_1.paddView}>
        <Section_1.ElevatedSection title="Primary Subscription">
            <Picker_1.Picker style={{ marginBottom: style_1.sizes.rem1 }} value={((_a = subscription === null || subscription === void 0 ? void 0 : subscription.data) === null || _a === void 0 ? void 0 : _a.cost) || 0} onSelect={function (item) {
            subscription.update({
                cost: item.row ? Math.pow(5, item.row) : 0
            });
        }} items={__spreadArray([], Array.from({ length: 10 }).map(function (v, i) {
            var cost = i ? Math.pow(5, i) : 0;
            return {
                label: cost ? "".concat(cost, "/month") : "Free",
                value: cost
            };
        }), true)}/>
            {/* Codes will go here   */}
            <PrimaryButton_1.PrimaryButton disabled={!subscription.hasChanged} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                if ((_a = subscription.data) === null || _a === void 0 ? void 0 : _a.id) {
                    api_1.Api.Subscription.update(subscription.data.id, {
                        cost: ((_b = subscription === null || subscription === void 0 ? void 0 : subscription.data) === null || _b === void 0 ? void 0 : _b.cost) || 0
                    });
                }
                else {
                    api_1.Api.Subscription.insert({
                        name: "Basic Subscription",
                        cost: ((_c = subscription === null || subscription === void 0 ? void 0 : subscription.data) === null || _c === void 0 ? void 0 : _c.cost) || 0,
                        user_id: ''
                    });
                }
                props.navigation.goBack();
                return [2 /*return*/];
            });
        }); }}>Apply</PrimaryButton_1.PrimaryButton>
        </Section_1.ElevatedSection>
    </react_native_1.View>;
};
exports.SubscriptionSettingsScreen = SubscriptionSettingsScreen;
