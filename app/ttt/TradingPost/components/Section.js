"use strict";
exports.__esModule = true;
exports.ElevatedSection = exports.Subsection = exports.Section = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var style_1 = require("../style");
var Headers_1 = require("./Headers");
function Section(props) {
    var title = props.title, children = props.children, useSubHeading = props.useSubHeading;
    return (<react_native_1.View style={[{ backgroundColor: "white", marginBottom: style_1.sizes.rem1 }, props.style]}>
            <react_native_1.View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {Boolean(title) && (useSubHeading ? <Headers_1.Subheader text={title} style={{ color: props.alt ? "#434343" : undefined }}/> : <Headers_1.Header text={title}/>)}
                {props.button && props.button({ height: style_1.sizes.rem1_5, width: style_1.sizes.rem1_5 })}
            </react_native_1.View>
            {children}
        </react_native_1.View>);
}
exports.Section = Section;
function Subsection(props) {
    return <Section useSubHeading {...props}/>;
}
exports.Subsection = Subsection;
var ElevatedSection = function (props) {
    var style = [[style_1.elevated, { paddingHorizontal: style_1.sizes.rem1 }], props.style];
    return <Section {...props} style={style}/>;
};
exports.ElevatedSection = ElevatedSection;
