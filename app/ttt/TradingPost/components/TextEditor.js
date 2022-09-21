"use strict";
exports.__esModule = true;
exports.TextEditorToolbar = exports.TextEditor = void 0;
var react_native_pell_rich_editor_1 = require("react-native-pell-rich-editor");
var TextEditor = function (props) {
    return <react_native_pell_rich_editor_1.RichEditor ref={props.editorRef}/>;
};
exports.TextEditor = TextEditor;
var TextEditorToolbar = function (props) {
    //const editorRef = useRef<RichToolbar>(null)
    return <react_native_pell_rich_editor_1.RichToolbar editor={props.editorRef}/>;
};
exports.TextEditorToolbar = TextEditorToolbar;
