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
exports.PostEditorScreen = void 0;
var api_1 = require("@tradingpost/common/api");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_toast_notifications_1 = require("react-native-toast-notifications");
var Headers_1 = require("../components/Headers");
var Label_1 = require("../components/Label");
var ScrollWithButtons_1 = require("../components/ScrollWithButtons");
var TextEditor_1 = require("../components/TextEditor");
var TextField_1 = require("../components/TextField");
var style_1 = require("../style");
var hooks_1 = require("../utils/hooks");
var PostEditorScreen = function (props) {
    var postEntity = (0, hooks_1.useReadonlyEntity)({
        content: "",
        title: "",
        subscription_level: "standard",
        photos: []
    }), _a = (0, react_1.useState)(false), locked = _a[0], setLocked = _a[1], editorRef = (0, react_1.useRef)(null), toast = (0, react_native_toast_notifications_1.useToast)();
    //[contentFocused, setContentFocused] = useState(false)
    return <react_native_1.View style={{ backgroundColor: "white", flexGrow: 1 }}>
        <Headers_1.Header text='+ New Post' style={{ marginBottom: 0, marginTop: 4, marginLeft: style_1.sizes.rem1, color: "black" }}/>
        <react_native_1.View style={{ marginHorizontal: style_1.sizes.rem1, marginTop: style_1.sizes.rem1 }}>
            <TextField_1.TextField label='Post Title' placeholder='Add a title to your post' {...(0, hooks_1.bindTextInput)(postEntity, "title", null)} markRequired/>
            <Label_1.Label>Content</Label_1.Label>
        </react_native_1.View>
        <react_native_1.View style={{ flex: 1, marginHorizontal: style_1.sizes.rem1 / 5 }}>
            <react_native_1.ScrollView onTouchEnd={function (ev) {
            //if (!contentFocused) {
            //editorRef.current?.focusContentEditor();
            //}
        }} style={[style_1.flex, {}]} contentContainerStyle={{ minHeight: "100%" }}>
                <TextEditor_1.TextEditor html={postEntity.data.content} onChangeHtml={function (html) {
            postEntity.update({ content: html });
        }}/>
                {/* <RichEditor onFocus={() => {
            setContentFocused(true)
        }} onBlur={() => setContentFocused(false)} containerStyle={{ minHeight: 1 }} initialContentHTML={postEntity.data.content} ref={editorRef} placeholder={"Add content to your post"}
            {...bindTextInputBase(postEntity, "content", null, { "onChangeTextKey": "onChange" })} /> */}
            </react_native_1.ScrollView>
        </react_native_1.View>
        {/* //TODO: add are you sure if dirty  */}
        <ScrollWithButtons_1.ButtonPanel locked={locked} left={{
            onPress: function () {
                props.navigation.goBack();
            },
            "text": "Cancel"
        }} right={{
            onPress: function () { return __awaiter(void 0, void 0, void 0, function () {
                var ex_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLocked(true);
                            if (!(!postEntity.data.content || !postEntity.data.title)) return [3 /*break*/, 1];
                            toast.show("Please provide a title and content for your post");
                            setLocked(false);
                            return [3 /*break*/, 4];
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            //const { id: postId } = 
                            return [4 /*yield*/, api_1.Api.Post.extensions.create(postEntity.data)];
                        case 2:
                            //const { id: postId } = 
                            _a.sent();
                            // Navigation.pop(props.componentId);
                            // const posts = await getPosts([postId]);
                            // screens.push(props.componentId, "Post",
                            //     { passProps: { post: posts[0] } });
                            props.navigation.goBack();
                            return [3 /*break*/, 4];
                        case 3:
                            ex_1 = _a.sent();
                            toast.show(ex_1.message);
                            setLocked(false);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); },
            "text": "Create"
        }}/>

    </react_native_1.View>;
};
exports.PostEditorScreen = PostEditorScreen;
