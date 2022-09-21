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
var react_1 = require("react");
// import * as React from 'react'
var style_1 = require("../style");
var react_native_1 = require("react-native");
var charts_js_1 = require("../charts-js/");
var react_native_svg_1 = require("react-native-svg");
var shape = require("d3-shape");
var misc_1 = require("../utils/misc");
exports["default"] = InteractiveChart;
function InteractiveChart(props) {
    var apx = function (size) {
        if (size === void 0) { size = 0; }
        var width = react_native_1.Dimensions.get('window').width; //useDimensions
        return (width / 750) * size;
    };
    if (!props.data) {
        props = { data: [{ date: String(new Date()), "return": 2 }, { date: String(new Date("9/1/2022")), "return": 1 }] };
    }
    //console.log(props.data.map((a: any) => a.date));
    var dateList = props.data.map(function (a) { return a.x; });
    //const [dateList, setDateList] = useState([]);
    var priceList = props.data.map(function (a) { return a.y; });
    //const [priceList, setPriceList] = useState([]);
    var size = (0, react_1.useRef)(dateList.length);
    size.current = dateList.length;
    var _a = (0, react_1.useState)(-1), positionX = _a[0], setPositionX = _a[1]; // The currently selected X coordinate position
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        // 要求成为响应者：
        onStartShouldSetPanResponder: function (evt, gestureState) { return true; },
        onStartShouldSetPanResponderCapture: function (evt, gestureState) { return true; },
        onMoveShouldSetPanResponder: function (evt, gestureState) { return true; },
        onMoveShouldSetPanResponderCapture: function (evt, gestureState) { return true; },
        onPanResponderTerminationRequest: function (evt, gestureState) { return true; },
        onPanResponderGrant: function (evt, gestureState) {
            updatePosition(evt.nativeEvent.locationX);
            return true;
        },
        onPanResponderMove: function (evt, gestureState) {
            updatePosition(evt.nativeEvent.locationX);
            return true;
        },
        onPanResponderRelease: function () {
            setPositionX(-1);
        }
    }));
    var updatePosition = function (x) {
        var YAxisWidth = apx(130);
        var x0 = apx(0); // x0 position
        var chartWidth = apx(750) - YAxisWidth - x0;
        var xN = x0 + chartWidth; //xN position
        var xDistance = chartWidth / size.current; // The width of each coordinate point
        if (x <= x0) {
            x = x0;
        }
        if (x >= xN) {
            x = xN;
        }
        // console.log((x - x0) )
        // The selected coordinate x :
        // (x - x0)/ xDistance = value
        var value = Number(((x - x0) / xDistance).toFixed(0));
        if (value >= size.current - 1) {
            value = size.current - 1; // Out of chart range, automatic correction
        }
        setPositionX(Number(value));
    };
    var CustomGrid = function (props) { return (<react_native_svg_1.G>
            {
        // Horizontal grid
        props.ticks.map(function (tick) { return (<react_native_svg_1.Line key={tick} x1="0%" x2="100%" y1={props.y(1)} y2={props.y(1)} strokeWidth={props.performance ? 0.5 : 0} stroke="#35A265"/>); })}
            {
        // Vertical grid
        /*
        priceList.map((_, index) => (
            <Line
                key={index.toString()}
                y1="0%"
                y2="0%"
                x1={props.x(index)}
                x2={props.x(index)}
                stroke="#EEF3F6"
            />
        ))
        */
        }
        </react_native_svg_1.G>); };
    var CustomLine = function (line) { return (<react_native_svg_1.Path key="line" d={line} stroke="#FEBE18" strokeWidth={apx(6)} fill="none"/>); };
    var CustomGradient = function () { return (<react_native_svg_1.Defs key="gradient">
            <react_native_svg_1.LinearGradient id="gradient" x1="0" x2="0%" y2="100%">
                {/* <Stop offset="0%" stopColor="rgb(134, 65, 244)" /> */}
                {/* <Stop offset="100%" stopColor="rgb(66, 194, 244)" /> */}

                <react_native_svg_1.Stop offset="0%" stopColor="#FEBE18" stopOpacity={0.25}/>
                <react_native_svg_1.Stop offset="100%" stopColor="#FEBE18" stopOpacity={0}/>
            </react_native_svg_1.LinearGradient>
        </react_native_svg_1.Defs>); };
    var Tooltip = function (props) {
        if (positionX < 0) {
            return null;
        }
        console.log(positionX);
        var date = dateList[positionX];
        return (<react_native_svg_1.G x={props.x(positionX)} key="tooltip">
                <react_native_svg_1.G x={positionX > size.current / 2 ? -apx(300 + 10) : apx(10)} y={props.y(priceList[positionX]) - apx(10)}>
                    <react_native_svg_1.Rect y={-apx(24 + 24 + 20) / 2} rx={apx(12)} // borderRadius
         ry={apx(12)} // borderRadius
         width={apx(300)} height={apx(96)} stroke="rgba(254, 190, 24, 0.27)" fill="rgba(255, 255, 255, 0.8)"/>

                    <react_native_svg_1.Text x={apx(20)} fill="#617485" opacity={0.65} fontSize={apx(24)}>
                        {(new Date(date)).toLocaleDateString()}
                    </react_native_svg_1.Text>
                    <react_native_svg_1.Text x={apx(20)} y={apx(24 + 20)} fontSize={apx(24)} fontWeight="bold" fill="rgba(224, 188, 136, 1)">
                        {(0, misc_1.toDollarsAndCents)(priceList[positionX])}
                    </react_native_svg_1.Text>
                </react_native_svg_1.G>

                <react_native_svg_1.G x={props.x}>
                    <react_native_svg_1.Line y1={props.ticks[0]} y2={props.ticks[Number(props.ticks.length)]} stroke="#FEBE18" strokeWidth={apx(4)} strokeDasharray={[6, 3]}/>

                    <react_native_svg_1.Circle cy={props.y(priceList[positionX])} r={apx(20 / 2)} stroke="#fff" strokeWidth={apx(2)} fill="#FEBE18"/>
                </react_native_svg_1.G>
            </react_native_svg_1.G>);
    };
    var verticalContentInset = { top: 10, bottom: 10 };
    return (<react_native_1.View style={{
            backgroundColor: '#fff',
            alignItems: 'stretch',
            borderWidth: 1,
            borderRadius: style_1.sizes.rem1,
            borderColor: "#ccc",
            padding: style_1.sizes.rem0_5
        }}>
            <react_native_1.View style={{
            flexDirection: 'row',
            width: "100%",
            //height: apx(570),
            aspectRatio: 16 / 9,
            alignSelf: 'stretch'
        }}>
                <react_native_1.View style={{ flex: 1 }} {...panResponder.current.panHandlers}>
                    <charts_js_1.LineChart style={{ flex: 1 }} data={priceList} 
    //curve={shape.curveNatural}
    curve={shape.curveMonotoneX} contentInset={__assign({}, verticalContentInset)} svg={{ stroke: "#11146F" }}>
                        {/*<CustomLine />*/}
                        <CustomGrid x={undefined} y={undefined} ticks={undefined} performance={props.performance}/>
                        <CustomGradient />
                        <Tooltip x={undefined} y={undefined} ticks={undefined}/>
                    </charts_js_1.LineChart>
                </react_native_1.View>

                <charts_js_1.YAxis style={{ width: "12%" }} data={priceList} contentInset={verticalContentInset} svg={{ fontSize: apx(18), fill: '#617485', fontFamily: 'K2D' }} numberOfTicks={5} formatLabel={function (value, index) { return "$".concat(String(value).split('.')[0].length > 2 ? value.toFixed(1) : value.toFixed(2)); }}/>
            </react_native_1.View>
            <charts_js_1.XAxis style={{
            alignSelf: 'stretch',
            // marginTop: apx(57),
            width: "100%",
            height: apx(70)
        }} numberOfTicks={props.period === '1D' ? 1 : 5} data={priceList} formatLabel={function (value, index) { return ['1D', '1W', '1M'].includes(props.period) ? (0, misc_1.toDateDayMonth)(dateList[value]) : (0, misc_1.toDateMonthYear)(dateList[value]); }} contentInset={{
            left: apx(46),
            right: apx(100)
        }} svg={{
            fontSize: apx(18),
            fill: '#617485',
            y: apx(20),
            fontFamily: 'K2D',
            rotation: 30,
            textAnchor: 'start'
            // originY: 30,
        }}/>
        </react_native_1.View>);
}
