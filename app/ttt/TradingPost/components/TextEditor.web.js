"use strict";
exports.__esModule = true;
exports.TextEditor = void 0;
//react-native-pell-rich-editor
var pell_1 = require("pell");
var react_1 = require("react");
var react_2 = require("react");
var react_3 = require("react");
require("../css/pell.css");
// export const TextEditor = (props: {
//     editorRef: MutableRefObject<any>
// }) => {
//     return <div ref={props.editorRef} />
// }
var TextEditor = function (props) {
    var _a = (0, react_3.useState)(props.html), html = _a[0], setHtml = _a[1];
    var divRef = (0, react_1.useRef)(null);
    (0, react_2.useEffect)(function () {
        if (divRef.current) {
            var editor = pell_1["default"].init({
                element: divRef.current,
                onChange: function (html) {
                    //(props.editorRef.current as HTMLDivElement).innerHTML = html;
                    props.onChangeHtml(html);
                    setHtml(html);
                },
                actions: ['bold',
                    'underline',
                    'olist',
                    'ulist',
                    'italic',
                    {
                        name: 'backColor',
                        icon: '<div style="background-color:yellow;">A</div>',
                        title: 'Highlight Color',
                        result: function () { return (0, pell_1.exec)('backColor', 'pink'); }
                    },
                    // {
                    //     name: 'image',
                    //     result: () => {
                    //         const url = window.prompt('Enter the image URL')
                    //         if (url) exec('insertImage', url)
                    //     }
                    // },
                    {
                        name: 'link',
                        result: function () {
                            var url = window.prompt('Enter the link URL');
                            if (url)
                                (0, pell_1.exec)('createLink', url);
                        }
                    }]
            });
            editor.content.innerHTML = html;
        }
    }, []);
    return <div style={{
            backgroundColor: "#fefefe",
            display: "flex",
            flexGrow: 1,
            flexDirection: "column"
        }} className='WTF' ref={divRef}></div>;
};
exports.TextEditor = TextEditor;
