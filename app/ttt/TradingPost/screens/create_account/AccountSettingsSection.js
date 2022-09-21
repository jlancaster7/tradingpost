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
exports.AccountSettings = void 0;
var react_1 = require("react");
var ButtonField_1 = require("../../components/ButtonField");
var IconfiyIcon_1 = require("../../components/IconfiyIcon");
var Section_1 = require("../../components/Section");
var style_1 = require("../../style");
var shared_1 = require("./shared");
var stripe_1 = require("@iconify/icons-logos/stripe");
var checkerboard_1 = require("@iconify/icons-mdi/checkerboard");
//import { SetDashboardLayout } from "../../layouts/DashboardLayout"
//import { deleteAccount, UpdateUserProfile } from "../../apis/Authentication"
var hooks_1 = require("../../utils/hooks");
var ScrollWithButtons_1 = require("../../components/ScrollWithButtons");
var react_native_1 = require("react-native");
//import { getPlaidLink, setPlaidToken } from "../../apis/PlaidApi"
function AccountSettings(props) {
    var _this = this;
    var _a = (0, shared_1.useChangeLock)(props), lockButtons = _a[0], setLockButtons = _a[1], broadcastEntity = (0, hooks_1.useReadonlyEntity)(/*props.user.data.settings?.broadcasting*/ {}), notificationEntity = (0, hooks_1.useReadonlyEntity)(/*props.user.data.settings?.notifications*/ {}), _b = (0, react_1.useState)(), token = _b[0], setToken = _b[1];
    (0, react_1.useEffect)(function () {
        if (props.saveOnly)
            setLockButtons(!broadcastEntity.hasChanged && !notificationEntity.hasChanged);
    }, [props.saveOnly, broadcastEntity.hasChanged, notificationEntity.hasChanged]);
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); })();
    }, []);
    return <ScrollWithButtons_1.ScrollWithButtons buttons={{
            locked: lockButtons,
            left: props.saveOnly ? undefined : {
                text: 'Not Now',
                onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        setLockButtons(true);
                        try {
                            //      await UpdateUserProfile({ status_setup: true });
                            //    SetDashboardLayout();
                        }
                        catch (ex) {
                            setLockButtons(false);
                        }
                        return [2 /*return*/];
                    });
                }); }
            },
            right: {
                text: props.saveOnly ? 'Apply' : 'Finish',
                onPress: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        setLockButtons(true);
                        try {
                            // await UpdateUserProfile({
                            //     status_setup: true,
                            //     settings: {
                            //         notifications: notificationEntity.data,
                            //         broadcasting: broadcastEntity.data
                            //     }
                            // });
                            notificationEntity.resetData(notificationEntity.data);
                            broadcastEntity.resetData(broadcastEntity.data);
                            // if (!props.saveOnly)
                            //     SetDashboardLayout();
                        }
                        catch (ex) {
                            setLockButtons(false);
                        }
                        return [2 /*return*/];
                    });
                }); }
            }
        }}>
        <react_native_1.View style={{ margin: shared_1.sideMargin }}>
            <Section_1.Section title='Push Notifications'>
                {/* <Subsection title='Posts'>
            <SwitchField label='Mentions' compact switchProps={bindSwitch(notificationEntity, "posts_disableMentions", null, true)} />
            <SwitchField label='Upvotes' compact switchProps={bindSwitch(notificationEntity, "posts_disableUpvotes", null, true)} />
        </Subsection>
        <Subsection title='Shared Watchlist'>
            <SwitchField label='Price Movement' compact switchProps={bindSwitch(notificationEntity, "sharedWatchlist_disablePrice", null, true)} />
            <SwitchField label='Changes' compact switchProps={bindSwitch(notificationEntity, "sharedWatchlist_disableChanges", null, true)} />
        </Subsection>
        <Subsection title='Watchlist'>
            <SwitchField label='Price Movement' compact switchProps={bindSwitch(notificationEntity, "watchlist_disablePrice", null, true)} />
        </Subsection>
        <Subsection title='Email'>
            <SwitchField label='Trade Alerts' compact switchProps={bindSwitch(notificationEntity, "email_tradeAlerts", null, true)} />
        </Subsection> */}
            </Section_1.Section>
            <Section_1.Section title='Broadcasting'>
                <Section_1.Subsection title='Accounts'>
                    {token && <ButtonField_1.PlaidButtonField plaidProps={{
                tokenConfig: {
                    token: token,
                    noLoadingState: true
                }
            }} inactiveText="Manage" leftElement={function (props) {
                return <IconfiyIcon_1.IconifyIcon icon={checkerboard_1["default"]} style={{ height: style_1.sizes.rem2, width: style_1.sizes.rem2, marginRight: style_1.sizes.rem1 / 2 }} currentColor='black'/>;
            }} label='Brokerage Account' compact/>}
                    <ButtonField_1.ButtonField leftElement={function (props) {
            return <IconfiyIcon_1.IconifyIcon icon={stripe_1["default"]} style={{ height: style_1.sizes.rem2, width: style_1.sizes.rem2, marginRight: style_1.sizes.rem1 / 2 }}/>;
        }} label='Stripe Account' compact/>
                </Section_1.Subsection>
                <Section_1.Subsection title='Display'>
                    {/* <SwitchField label='Performance' compact switchProps={bindSwitch(broadcastEntity, "enableHoldings", null, true)} />
        <SwitchField label='Portfolio' compact switchProps={bindSwitch(broadcastEntity, "disableProfile", null, true)} />
    <SwitchField label='Trades' compact switchProps={bindSwitch(broadcastEntity, "enableTrades", null, true)} /> */}
                </Section_1.Subsection>
                <Section_1.Section title='Management'>
                    <ButtonField_1.ButtonField onPress={function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    //await deleteAccount();
                }
                catch (ex) {
                    props.toastMessage(ex.message);
                }
                return [2 /*return*/];
            });
        }); }} label='DELETE ACCOUNT' isActive secondary activeText="FOREVER"/>
                </Section_1.Section>
            </Section_1.Section>
        </react_native_1.View>
    </ScrollWithButtons_1.ScrollWithButtons>;
}
exports.AccountSettings = AccountSettings;
