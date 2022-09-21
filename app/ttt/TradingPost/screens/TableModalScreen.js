"use strict";
exports.__esModule = true;
exports.TableModalScreen = exports.LimitedTable = void 0;
var react_1 = require("react");
var Table_1 = require("../components/Table");
var react_native_1 = require("react-native");
var components_1 = require("@ui-kitten/components");
var native_1 = require("@react-navigation/native");
var Link_1 = require("../components/Link");
var style_1 = require("../style");
var Section_1 = require("../components/Section");
function LimitedTable(props) {
    var nav = (0, native_1.useNavigation)();
    return <react_native_1.View style={[{}]}>
        <react_native_1.View>
            <Table_1.Table {...props.tableProps} maxPage={props.maxPage}/>
        </react_native_1.View>
        <Link_1.Link style={{
            marginLeft: "auto"
        }} onPress={function () {
            nav.navigate("TableModal", {
                tableProps: props.tableProps,
                title: props.title
            });
        }}>View All</Link_1.Link>
    </react_native_1.View>;
}
exports.LimitedTable = LimitedTable;
function TableModalScreen(props) {
    var _a, _b, _c, _d;
    return ((_b = (_a = props.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.tableProps) ? <react_native_1.View style={style_1.paddView}><Section_1.ElevatedSection title={props.route.params.title}><Table_1.Table {...(_d = (_c = props.route) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.tableProps}/></Section_1.ElevatedSection></react_native_1.View> : <components_1.Text>Error</components_1.Text>;
}
exports.TableModalScreen = TableModalScreen;
