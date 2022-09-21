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
exports.WatchlistPicker = exports.useWatchlistPicker = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var SecurityList_1 = require("../SecurityList");
var SearchBar_1 = require("./SearchBar");
var components_1 = require("@ui-kitten/components");
var List_1 = require("./List");
var style_1 = require("../style");
var cellStyle = { flexGrow: 1, aspectRatio: 1, justifyContent: "center", marginVertical: 4, alignItems: "center", flexBasis: 20 };
var numItemsPerRow = 4;
//TODO: Need to optimize security load
var empty = {};
//helper until i  lean this up
var useWatchlistPicker = function () {
    var _a = (0, react_1.useState)({}), selectedItems = _a[0], setSelectedItems = _a[1];
    return {
        selectionConverter: (0, react_1.useRef)(null),
        selectedItems: selectedItems,
        onSelectedItemschanged: setSelectedItems,
        symbolConverter: (0, react_1.useRef)(null)
    };
};
exports.useWatchlistPicker = useWatchlistPicker;
var WatchlistPicker = function (props) {
    var _a = (0, react_1.useState)(""), searchText = _a[0], setSearchText = _a[1], selectedItems = props.selectedItems, _b = (0, react_1.useState)([]), data = _b[0], setData = _b[1], _c = (0, react_1.useState)(""), datasetKey = _c[0], setDatasetKey = _c[1], securities = (0, SecurityList_1.useSecuritiesList)().securities.list;
    //    if (props.selectionConverter) {
    //This is a all part of just getting done quickly.. need ot clean this up 
    (0, react_1.useEffect)(function () {
        if (securities.length && props.securitiesLoaded) {
            props.securitiesLoaded();
        }
    }, [securities.length, Boolean(props.securitiesLoaded)]);
    props.selectionConverter.current = securities.length ? function (_selectedItems) { return securities.filter(function (s) { return _selectedItems[s.id]; }); } : null;
    props.symbolConverter.current = securities.length ? function (_symbols) {
        var output = {};
        securities.forEach(function (s) {
            if (_symbols.find(function (_s) { return _s === s.symbol; }))
                output[s.id] = true;
        });
        return output;
    } : null;
    //}
    //  else if (props.selectionConverter)
    var delayRef = (0, react_1.useRef)(0);
    var selectedItemCount = Object.keys(selectedItems).length;
    (0, react_1.useEffect)(function () {
        if (delayRef.current)
            clearTimeout(delayRef.current);
        delayRef.current = setTimeout(function () {
            var items = securities.filter(function (s, i) {
                return (!searchText && (i < 25 || selectedItems[s.id])) ||
                    ((searchText.length >= 3 && new RegExp(searchText, "gi").test(s.security_name))) ||
                    (searchText.length && (new RegExp(searchText, "gi")).test(s.symbol));
            }).sort(function (a, b) {
                if (selectedItems[a.id] && !selectedItems[b.id])
                    return -1;
                else if (selectedItems[b.id] && !selectedItems[a.id])
                    return 1;
                else {
                    return (function () {
                        if (searchText) {
                            if (searchText.length <= 3) {
                                var aStartsWith = new RegExp("^" + searchText, "gi").test(a.symbol);
                                var bStartsWith = new RegExp("^" + searchText, "gi").test(b.symbol);
                                if (aStartsWith && !bStartsWith)
                                    return -1;
                                else if (!aStartsWith && bStartsWith)
                                    return 1;
                                else
                                    return a.symbol.localeCompare(b.symbol);
                            }
                            else
                                return a.symbol.localeCompare(b.symbol);
                        }
                        else
                            return 0;
                    })();
                }
                //? a.symbol.localeCompare(b.symbol) : 
                //                (selectedItems[a.id] ? -1 : -1)
            });
            var gap = Array.from({ length: numItemsPerRow - (items.length % numItemsPerRow) }, function () { return empty; });
            if (gap.length !== 4)
                items.push.apply(items, gap);
            setData(items);
            setDatasetKey(searchText);
        }, 333);
    }, [searchText, securities, selectedItems]);
    return <react_native_1.View style={style_1.flex}>
        <react_native_1.View style={{ padding: 8 }}>
            <SearchBar_1.SearchBar onTextChange={function (text) { return setSearchText(text); }} onLayout={undefined}/>
        </react_native_1.View>
        <react_native_1.View style={style_1.flex}>
            <List_1.List numColumns={numItemsPerRow} data={data} datasetKey={datasetKey ? datasetKey : data.filter(function (d) { return d !== empty; }).length} renderItem={function (i) {
            return <SecurityCell item={i.item} isSelected={isSec(i.item) ? (selectedItems[i.item.id] || false) : false} onPressed={function (isSelected) {
                    if (isSec(i.item)) {
                        var selectedClone = __assign({}, selectedItems);
                        if (isSelected)
                            selectedClone[i.item.id] = true;
                        else
                            delete selectedClone[i.item.id];
                        props.onSelectedItemschanged(selectedClone);
                        //setSelectedItems(selectedClone);
                        return true;
                    }
                    return false;
                }}/>;
        }} loadingItem={undefined}/>
        </react_native_1.View>
    </react_native_1.View>;
};
exports.WatchlistPicker = WatchlistPicker;
var isSec = function (item) {
    return item !== empty;
};
var SecurityCell = function (props) {
    var item = props.item, onPressed = props.onPressed, isSelected = props.isSelected;
    var _a = (0, react_1.useState)(isSelected), innerSelected = _a[0], setInnerSelected = _a[1];
    return <react_native_1.Pressable onPress={function () {
            if (onPressed(!innerSelected)) {
                setInnerSelected(!innerSelected);
            }
        }} style={cellStyle}>
        {isSec(item) ? <><react_native_1.View>
            <components_1.Avatar shape='square' source={{ uri: item.logo_url }} size="giant"/>
            {innerSelected && <react_native_1.View style={{ position: "absolute", width: "40%", aspectRatio: 1, zIndex: 50000, right: "-10%", bottom: "-10%" }}>
                <react_native_1.View style={{ backgroundColor: "white", position: "absolute", left: "25%", top: "25%", height: "50%", width: "50%" }}/>
                <components_1.Icon name="checkmark-circle-2" fill="green" style={{ height: "100%", width: "100%" }}/>
            </react_native_1.View>}
        </react_native_1.View>
            <react_native_1.Text>{item.symbol}</react_native_1.Text>
        </> : null}
    </react_native_1.Pressable>;
};
