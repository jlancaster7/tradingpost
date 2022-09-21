"use strict";
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
exports.WatchlistSection = void 0;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var WatchlistViewerScreen_1 = require("../screens/WatchlistViewerScreen");
var AddButton_1 = require("./AddButton");
var Section_1 = require("./Section");
var Table_1 = require("./Table");
function WatchlistSection(props) {
    var nav = (0, native_1.useNavigation)();
    var fields = !props.shared ?
        [{ field: "name", alias: "Name", align: "left" },
            { field: "item_count", alias: "Items" },
            { field: "saved_by_count", alias: "Saves" },
            { field: "type" }] :
        [{ field: "name", alias: "Name", align: "left" },
            {
                field: "user",
                align: "left",
                alias: "Analyst",
                stringify: function (user, key, item) {
                    return user[0].handle;
                }
            }];
    var _a = (0, WatchlistViewerScreen_1.useNoteField)(props.hideNoteOnEmpty), column = _a.column, shownMap = _a.shownMap;
    return <Section_1.ElevatedSection title={props.title} button={props.showAddButton ? function (p) { return <AddButton_1.AddButton height={p.height} width={p.width} onPress={function () {
                nav.navigate("WatchlistEditor");
            }}/>; } : undefined}>
        <Table_1.Table noDataMessage={props.shared ? "No Shared Watchlists" : "No Watchlists"} columns={__spreadArray(__spreadArray([], fields, true), [
            column
        ], false)} rowPressed={function (item, idx) {
            nav.navigate("WatchlistViewer", {
                watchlistId: item.id
            });
        }} renderAuxItem={function (info) { return shownMap[info.index] ? <react_native_1.Text><react_native_1.Text style={{ fontWeight: "bold" }}>Details: </react_native_1.Text>{info.item.note}</react_native_1.Text> : null; }} data={props.watchlists}/>
    </Section_1.ElevatedSection>;
}
exports.WatchlistSection = WatchlistSection;
