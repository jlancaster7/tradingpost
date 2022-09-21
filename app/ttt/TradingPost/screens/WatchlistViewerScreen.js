"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.WatchlistViewerScreen = exports.useWatchlistItemColumns = exports.useMakeSecurityFields = exports.useNoteField = void 0;
var native_1 = require("@react-navigation/native");
var api_1 = require("@tradingpost/common/api");
var WatchlistApi_1 = require("@tradingpost/common/api/entities/apis/WatchlistApi");
var components_1 = require("@ui-kitten/components");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var Authentication_1 = require("../Authentication");
var AddButton_1 = require("../components/AddButton");
var ProfileBar_1 = require("../components/ProfileBar");
var Section_1 = require("../components/Section");
var Table_1 = require("../components/Table");
var TextField_1 = require("../components/TextField");
var Colors_1 = require("../constants/Colors");
var style_1 = require("../style");
var SecurityList_1 = require("../SecurityList");
var misc_1 = require("../utils/misc");
var useNoteField = function (hideEmptyNote) {
    var _a = (0, react_1.useState)({}), shownMap = _a[0], setShownMap = _a[1];
    return {
        shownMap: shownMap,
        column: {
            field: function (info) {
                return <react_native_1.Pressable onPress={function () {
                        var _a;
                        if (info.item.note || !hideEmptyNote) {
                            setShownMap(__assign(__assign({}, shownMap), (_a = {}, _a[info.index] = !shownMap[info.index], _a)));
                        }
                    }}>
                    <components_1.Icon style={{ opacity: (info.item.note || !hideEmptyNote) ? (info.item.note ? 1 : 0.25) : 0, height: 16, width: 32 }} name={!shownMap[info.index] ? "file-text-outline" : "close-outline"} fill={Colors_1.AppColors.primary}/></react_native_1.Pressable>;
            }, alias: " ", width: 32
        }
    };
};
exports.useNoteField = useNoteField;
var SecPressable = function (props) {
    var nav = (0, native_1.useNavigation)();
    return <react_native_1.Pressable onPress={function () {
            nav.navigate("Company", {
                securityId: props.securityId
            });
        }}>{props.children}</react_native_1.Pressable>;
};
var useMakeSecurityFields = function (getIdValue) {
    var _a = (0, SecurityList_1.useSecuritiesList)().securities, bySymbol = _a.bySymbol, byId = _a.byId;
    return [{
            field: function (a) { return <SecPressable securityId={(function () {
                    var _a, _b;
                    var value = getIdValue(a.item);
                    if (typeof value === "string")
                        return ((_a = bySymbol[value]) === null || _a === void 0 ? void 0 : _a.id) || -1;
                    else
                        return ((_b = byId[value]) === null || _b === void 0 ? void 0 : _b.id) || -1;
                })()}><components_1.Avatar style={{ marginRight: style_1.sizes.rem0_5 }} source={(function () {
                    var value = getIdValue(a.item);
                    if (typeof value === "string")
                        return bySymbol[value] ? { uri: bySymbol[value].logo_url } : undefined;
                    else
                        return byId[value] ? { uri: byId[value].logo_url } : undefined;
                })()} size="tiny"/></SecPressable>; },
            headerStyle: {
                width: style_1.sizes.rem10 / 2,
                //marginRight: sizes.rem0_5,
                overflow: "visible"
            },
            alias: "Ticker",
            align: "left",
            width: style_1.sizes.rem2
        },
        {
            alias: "",
            width: style_1.sizes.rem6 / 2,
            align: "left",
            style: { lineHeight: style_1.sizes.rem1_5 },
            headerStyle: {
                width: 0
            },
            stringify: function (value, key, item) {
                var _a, _b;
                var v = getIdValue(item);
                if (typeof v === "string")
                    return ((_a = bySymbol[v]) === null || _a === void 0 ? void 0 : _a.symbol) || "";
                else
                    return ((_b = byId[v]) === null || _b === void 0 ? void 0 : _b.symbol) || "";
            }
        }
    ];
};
exports.useMakeSecurityFields = useMakeSecurityFields;
var useWatchlistItemColumns = function (hideEmptyNote) {
    var _a = (0, exports.useMakeSecurityFields)(function (item) { return item.symbol; }), iconField = _a[0], secField = _a[1];
    var _b = (0, exports.useNoteField)(hideEmptyNote), column = _b.column, shownMap = _b.shownMap;
    return {
        shownMap: shownMap,
        columns: [
            iconField,
            secField,
            {
                alias: "Price",
                stringify: function (a, b, c) {
                    var _a;
                    if ((_a = c.price) === null || _a === void 0 ? void 0 : _a.price) {
                        return (0, misc_1.toDollarsAndCents)(c.price.price);
                    }
                    else
                        return "-";
                }
            },
            {
                alias: "Date",
                stringify: function (a, b, c) {
                    var _a;
                    if ((_a = c.price) === null || _a === void 0 ? void 0 : _a.time) {
                        return (new Date(Date.parse(c.price.time))).toLocaleDateString() || "-";
                    }
                    else {
                        return null;
                    }
                }
            },
            column
            //        { field: "symbol", align: "left", style: { lineHeight: sizes.rem1_5 } },
        ]
    };
};
exports.useWatchlistItemColumns = useWatchlistItemColumns;
var WatchlistViewerScreen = function (props) {
    var _a, _b;
    var _c = (0, react_1.useState)(), watchlist = _c[0], setWatchlist = _c[1];
    var watchlistId = (_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.watchlistId;
    var _d = (0, react_1.useState)(false), isSaved = _d[0], setIsFav = _d[1];
    var appUser = (0, Authentication_1.useAppUser)().appUser;
    var _e = (0, exports.useWatchlistItemColumns)((watchlist === null || watchlist === void 0 ? void 0 : watchlist.user[0].id) !== (appUser === null || appUser === void 0 ? void 0 : appUser.id)), shownMap = _e.shownMap, columns = _e.columns;
    var toast = (0, react_native_toast_notifications_1.useToast)();
    (0, react_1.useEffect)(function () {
        if (watchlistId)
            WatchlistApi_1["default"].get(watchlistId).then(function (w) {
                setIsFav(w.is_saved);
                setWatchlist(w);
            });
    }, [watchlistId]);
    return <react_native_1.View style={style_1.paddView}>
        <Section_1.ElevatedSection title={(watchlist === null || watchlist === void 0 ? void 0 : watchlist.name) || ""} button={function (_p) {
            return (watchlist === null || watchlist === void 0 ? void 0 : watchlist.user[0].id) === (appUser === null || appUser === void 0 ? void 0 : appUser.id) ? <AddButton_1.EditButton {..._p} onPress={function () {
                    props.navigation.navigate("WatchlistEditor", {
                        watchlistId: watchlistId
                    });
                }}/> : <AddButton_1.FavButton isSelected={isSaved} {..._p} onPress={function () {
                    if (watchlistId) {
                        api_1.Api.Watchlist.extensions.saveWatchlist({
                            id: watchlistId,
                            is_saved: !isSaved
                        });
                        setIsFav(function (f) { return !f; });
                        toast.show("Watchlist Added");
                    }
                }}/>;
        }}>

            <ProfileBar_1.ProfileBar user={watchlist === null || watchlist === void 0 ? void 0 : watchlist.user[0]}/>
            <react_native_1.Text style={[{ marginVertical: style_1.sizes.rem0_5 }, !(watchlist === null || watchlist === void 0 ? void 0 : watchlist.note) ? { color: "#ccc", fontStyle: "italic" } : undefined]}>{(watchlist === null || watchlist === void 0 ? void 0 : watchlist.note) || "No Notes"}</react_native_1.Text>
        </Section_1.ElevatedSection>
        <Section_1.ElevatedSection title="Items">
            <Table_1.Table data={watchlist === null || watchlist === void 0 ? void 0 : watchlist.items} columns={columns} renderAuxItem={function (info) {
            return shownMap[info.index] && watchlist ?
                <NoteEditor note={info.item.note} onChangeNote={function (note) {
                        info.item.note = note;
                    }} canEdit={(watchlist === null || watchlist === void 0 ? void 0 : watchlist.user[0].id) === (appUser === null || appUser === void 0 ? void 0 : appUser.id)} ticker={info.item.symbol} watchlistId={watchlist.id}/>
                : null;
        }}/>
        </Section_1.ElevatedSection>
        <Section_1.ElevatedSection title="Comments"></Section_1.ElevatedSection>
    </react_native_1.View>;
};
exports.WatchlistViewerScreen = WatchlistViewerScreen;
var NoteEditor = function (props) {
    var _a = (0, react_1.useState)(!props.note && props.canEdit), isEdit = _a[0], setIsEdit = _a[1];
    var _b = (0, react_1.useState)(props.note), note = _b[0], setNote = _b[1];
    return (!props.canEdit || (!isEdit && note)) ?
        <react_native_1.View style={{ flexDirection: "row", alignItems: "center" }}><react_native_1.Text><react_native_1.Text style={{ fontWeight: "bold" }}>Note:</react_native_1.Text>{note}</react_native_1.Text>
            {props.canEdit && <AddButton_1.EditButton style={{ marginLeft: "auto" }} height={24} width={24} onPress={function () {
                    setIsEdit(true);
                }}/>}

        </react_native_1.View> :
        <react_native_1.View style={[style_1.row, { alignItems: "center" }]}><TextField_1.TextField placeholder="Add a note" style={style_1.flex} value={note} onChangeText={function (t) {
                setNote(t);
            }}/><react_native_1.Pressable onPress={function () {
                props.onChangeNote(note || "");
                setIsEdit(false);
            }}><components_1.Icon name="checkmark-outline" fill={Colors_1.AppColors.primary} style={{
                height: 24,
                width: 24
            }}/>
            </react_native_1.Pressable>
        </react_native_1.View>;
};
