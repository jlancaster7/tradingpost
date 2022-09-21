"use strict";
exports.__esModule = true;
exports.CompanyScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var components_1 = require("@ui-kitten/components");
var style_1 = require("../style");
var Section_1 = require("../components/Section");
var components_2 = require("@ui-kitten/components");
var AddButton_1 = require("../components/AddButton");
var misc_1 = require("../utils/misc");
var InteractiveGraph_1 = require("../components/InteractiveGraph");
var ButtonGroup_1 = require("../components/ButtonGroup");
var FeedScreen_1 = require("./FeedScreen");
var periods = {
    "1D": 1,
    "1W": 5,
    "1M": 20,
    "3M": 60,
    "1Y": 252,
    "2Y": 252 * 2,
    "5Y": 252 * 5,
    "Max": 252 * 10
};
var tabBarMargin = style_1.sizes.rem1;
var CompanyScreen = function (props) {
    var _a, _b, _c;
    var _d = (0, react_1.useState)(), security = _d[0], setSecurity = _d[1];
    var _e = (0, react_1.useState)(), securityPrices = _e[0], setSecurityPrices = _e[1];
    var securityId = props.route.params.securityId;
    var toast = (0, react_native_toast_notifications_1.useToast)();
    var _f = (0, react_1.useState)(false), isFav = _f[0], setIsFav = _f[1];
    var _g = (0, react_1.useState)(), description = _g[0], setDescription = _g[1];
    var _h = (0, react_1.useState)("1Y"), portPeriod = _h[0], setPortPeriod = _h[1];
    var _j = (0, react_1.useState)(0), tab = _j[0], setTab = _j[1];
    (0, react_1.useEffect)(function () {
        api_1.Api.Security.get(securityId)
            .then(function (s) {
            setSecurity(s);
            s.description ? setDescription(s.description.substring(0, 300) + '...') :
                setIsFav(s.isOnQuickWatch || false);
        })["catch"](function (ex) { return toast.show(ex.message); });
        api_1.Api.Security.extensions.getPrices({ securityId: securityId, includeIntraday: false, includeHistorical: true })
            .then(function (p) {
            var prices = p.historical.slice(p.historical.length - periods[portPeriod]).map(function (a) {
                return { x: a.date, y: a.close };
            });
            setSecurityPrices(prices);
        })["catch"](function (ex) { return toast.show(ex.message); });
    }, [securityId, portPeriod]);
    return <react_native_1.View>
        <react_native_1.View style={style_1.paddView}>
        <Section_1.ElevatedSection title="Company" button={function (p) {
            return <AddButton_1.FavButton {...p} isSelected={isFav} onPress={function () {
                    if (security) {
                        api_1.Api.Security.extensions.quickadd({
                            add: !isFav,
                            ticker: security === null || security === void 0 ? void 0 : security.symbol
                        });
                        setIsFav(!isFav);
                    }
                }}/>;
        }}>
            <react_native_1.View style={[style_1.row, { marginBottom: style_1.sizes.rem0_5 }]}>
                <components_1.Avatar source={{ uri: security === null || security === void 0 ? void 0 : security.logo_url }} style={{ marginRight: style_1.sizes.rem0_5 }}/>
                <react_native_1.View style={style_1.flex}>
                    <components_1.Text>{security === null || security === void 0 ? void 0 : security.symbol}</components_1.Text>
                    <components_1.Text>{security === null || security === void 0 ? void 0 : security.company_name}</components_1.Text>
                </react_native_1.View>
                <react_native_1.View>
                    <components_1.Text>{(0, misc_1.toDollarsAndCents)((_a = security === null || security === void 0 ? void 0 : security.price) === null || _a === void 0 ? void 0 : _a.price)}</components_1.Text>
                    <components_1.Text></components_1.Text>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[style_1.row, { marginVertical: style_1.sizes.rem0_5 }]}>
                <components_1.Text style={style_1.flex} category={"label"}>Open</components_1.Text>
                <components_1.Text style={style_1.flex} category={"c1"}>{(0, misc_1.toDollarsAndCents)((_b = security === null || security === void 0 ? void 0 : security.price) === null || _b === void 0 ? void 0 : _b.open)}</components_1.Text>
                <components_1.Text style={style_1.flex} category={"label"}>52 Wk High</components_1.Text>
                <components_1.Text style={style_1.flex} category={"c1"}>{(0, misc_1.toDollarsAndCents)(security === null || security === void 0 ? void 0 : security.week_52_high)}</components_1.Text>
            </react_native_1.View>
            <react_native_1.View style={[style_1.row, { marginBottom: style_1.sizes.rem1 }]}>
                <components_1.Text style={style_1.flex} category={"label"}>Close</components_1.Text>
                <components_1.Text style={style_1.flex} category={"c1"}>{(0, misc_1.toDollarsAndCents)((_c = security === null || security === void 0 ? void 0 : security.price) === null || _c === void 0 ? void 0 : _c.price)}</components_1.Text>
                <components_1.Text style={style_1.flex} category={"label"}>52 Wk Low</components_1.Text>
                <components_1.Text style={style_1.flex} category={"c1"}>{(0, misc_1.toDollarsAndCents)(security === null || security === void 0 ? void 0 : security.week_52_low)}</components_1.Text>
            </react_native_1.View>
            <react_native_1.View style={{ marginBottom: style_1.sizes.rem1 }}>
                <InteractiveGraph_1["default"] data={securityPrices} performance={false}/>
            </react_native_1.View>
            
            <ButtonGroup_1.ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"].map(function (v) { return ({ label: v, value: v }); })} onValueChange={function (v) { return setPortPeriod(v); }} value={portPeriod}/>

            <components_1.Text style={{ marginTop: style_1.sizes.rem1 }}>{description}</components_1.Text>
        </Section_1.ElevatedSection>
        </react_native_1.View>
        <react_native_1.View>
        <Section_1.ElevatedSection title="" style={{ marginHorizontal: style_1.sizes.rem1 }}>
                <components_2.TabBar indicatorStyle={{
            marginTop: 26,
            marginHorizontal: 10
        }} style={{ width: "100%", marginHorizontal: 0 }} selectedIndex={tab} onSelect={function (t) {
            setTab(t);
        }}>
                    {["Posts", "Analysts"].map(function (t) { return <components_2.Tab style={{ marginTop: -4 }} title={t}/>; })}
                </components_2.TabBar>
        </Section_1.ElevatedSection>
        <FeedScreen_1.FeedPart searchText={"$".concat(security === null || security === void 0 ? void 0 : security.symbol)}/>
            
        </react_native_1.View>
        
        
    </react_native_1.View>;
};
exports.CompanyScreen = CompanyScreen;
