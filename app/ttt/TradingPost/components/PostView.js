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
exports.PostView = exports.resolvePostContent = exports.postInnerHeight = exports.spaceOnSide = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var components_1 = require("@ui-kitten/components");
var style_1 = require("../style");
var IconfiyIcon_1 = require("./IconfiyIcon");
var Headers_1 = require("./Headers");
var PrimaryChip_1 = require("./PrimaryChip");
var images_1 = require("../images");
var style_2 = require("../style");
var IconButton_1 = require("./IconButton");
//import { screens } from '../navigationComponents'
//import { fullDashOptions } from '../layouts/DashboardLayout'
var AsyncPressable_1 = require("./AsyncPressable");
var api_1 = require("@tradingpost/common/api");
var HtmlView_1 = require("./HtmlView");
var react_native_2 = require("react-native");
var ProfileButton_1 = require("./ProfileButton");
var native_1 = require("@react-navigation/native");
//import { setBookmarked } from '../apis/PostApi'
//import { openProfileScreen } from '../screens/ProfileScreen'
var postTotalVerticalMargin = style_1.sizes.rem1;
var postTotalHorizontalMargin = style_1.sizes.rem2;
var postSidePad = style_1.sizes.rem2;
var postTotalBorder = 2; //4;
exports.spaceOnSide = postTotalHorizontalMargin + postTotalBorder + postSidePad;
var postInnerHeight = function (itm, windowWidth) {
    var size = itm === null || itm === void 0 ? void 0 : itm._source.size;
    if ((itm === null || itm === void 0 ? void 0 : itm._source.postType) === "substack") {
        return 200;
    }
    else if (size) {
        return windowWidth / size.aspectRatio + ((itm === null || itm === void 0 ? void 0 : itm._source.postType) === "tweet" ? 20 * windowWidth / itm._source.size.maxWidth : 0);
    }
    else if ((itm === null || itm === void 0 ? void 0 : itm._source.postType) === "youtube") {
        return windowWidth / (390 / 230);
    }
    else if ((itm === null || itm === void 0 ? void 0 : itm._source.postType) === "spotify") {
        return windowWidth / (360 / 162);
    }
    else {
        return 200;
    }
};
exports.postInnerHeight = postInnerHeight;
var resolvePostContent = function (itm, windowWidth) {
    switch (itm === null || itm === void 0 ? void 0 : itm._source.postType) {
        case "youtube":
            return itm._source.postUrl.replace("https://www.youtube.com/watch?v=", "//www.youtube.com/embed/");
        case 'tweet':
            return "<html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0\"></meta></head><body style=\"margin:0; padding:0;width:".concat(itm._source.size.maxWidth, "px;transform: scale(").concat(windowWidth / itm._source.size.maxWidth, ");transform-origin: top left;\">\n            ").concat(itm._source.content.htmlBody, "\n            </body></html>");
        case 'spotify':
            var matches = /src="(.*)"/.exec(itm._source.content.body);
            return (matches === null || matches === void 0 ? void 0 : matches[1]) || "";
        case 'substack':
        //return SubstackView({post: itm});
        /*
        return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"></meta></head>
        <body style="margin:0; padding:0;width:${itm?._source.size.maxWidth}px;transform: scale(${windowWidth / itm._source.size.maxWidth});transform-origin: top left;">
        <h1>${itm?._source.content.title}</h1>
        <p>${itm?._source.content.body}</p>
        </body></html>`
        */
        default:
            return (itm === null || itm === void 0 ? void 0 : itm._source.content.htmlBody) || "";
    }
};
exports.resolvePostContent = resolvePostContent;
function PostView(props) {
    var _this = this;
    var _a, _b, _c;
    var post = props.post;
    var nav = (0, native_1.useNavigation)();
    var _d = (0, react_1.useState)(Boolean(post.ext.is_bookmarked)), isBookmarked = _d[0], setIsBookmarked = _d[1];
    var _e = (0, react_1.useState)(Boolean(post.ext.is_upvoted)), isUpvoted = _e[0], setIsUpvoted = _e[1];
    var _f = (0, react_1.useState)(false), showStatus = _f[0], setShowStatus = _f[1];
    return <react_native_1.View style={{ marginHorizontal: postTotalHorizontalMargin / 2, marginVertical: postTotalVerticalMargin / 2 }}>
        <react_native_1.View style={[style_1.shadow, { backgroundColor: "white", borderRadius: style_1.sizes.borderRadius * 4, borderColor: "#ccc", borderWidth: postTotalBorder / 2 }]}>
            <react_native_1.Pressable onPress={function () {
            //openProfileScreen(props.parentComponentId, props.post.creator.id_creator);
        }} style={[style_1.row, { alignItems: "center", overflow: "hidden", borderBottomColor: "#ccc", borderBottomWidth: 1, padding: style_1.sizes.rem1 / 2 }]}>
                {<ProfileButton_1.ProfileButton userId={props.post._source.user.id} profileUrl={((_a = props.post.ext.user) === null || _a === void 0 ? void 0 : _a.profile_url) || ""} size={56}/>}
                <react_native_1.View style={[style_1.flex, { marginLeft: style_1.sizes.rem1_5 }]}>
                    <react_native_1.Pressable onPress={function () {
            if (props.post._source.user.id)
                nav.navigate("Profile", {
                    userId: props.post._source.user.id
                });
        }}>
                        <Headers_1.Subheader text={"@" + (((_b = props.post.ext.user) === null || _b === void 0 ? void 0 : _b.handle) || "NoUserAttached")} style={{ color: "black", fontWeight: "bold" }}/>
                    </react_native_1.Pressable>
                    <react_native_1.View>
                        <react_native_1.ScrollView nestedScrollEnabled horizontal>
                            <react_native_1.View style={style_1.row}>
                                {(((_c = props.post.ext.user) === null || _c === void 0 ? void 0 : _c.tags) || ["No", "Tags", "Here"]).map(function (chip, i) {
            return <PrimaryChip_1.PrimaryChip isAlt key={i} label={chip}/>;
        })}
                            </react_native_1.View>
                        </react_native_1.ScrollView>
                    </react_native_1.View>
                </react_native_1.View>
                <AsyncPressable_1.AsyncPressable onPress={function () { return __awaiter(_this, void 0, void 0, function () {
            var resp, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, api_1.Api.Post.extensions.setBookmarked({
                                id: props.post._id,
                                is_bookmarked: !isBookmarked
                            })];
                    case 1:
                        resp = _a.sent();
                        setIsBookmarked(Boolean(resp.is_bookmarked));
                        return [3 /*break*/, 3];
                    case 2:
                        ex_1 = _a.sent();
                        console.error(ex_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }}>
                    {!isBookmarked && <IconButton_1.IconButton iconSource={images_1.BookmarkIcons.inactive} style={{ height: 24, width: 24, marginLeft: "auto" }}/>}
                    {isBookmarked && <images_1.BookmarkActive style={{ height: 16, width: 16, marginLeft: "auto", marginRight: style_1.sizes.rem0_5 / 2 }}/>}
                </AsyncPressable_1.AsyncPressable>
            </react_native_1.Pressable>
            <react_native_1.Pressable onPress={function () {
            nav.navigate("PostScreen", {
                post: post
            });
        }} style={{ paddingHorizontal: postSidePad / 2 }}>
                <PostContentView post={post}/>
            </react_native_1.Pressable>
            {(props.post._source.postType !== "tweet") &&
            <react_native_1.View style={[style_1.row, { alignItems: "center", marginTop: "auto", borderTopColor: "#ccc", borderTopWidth: 1 }]}>
                    {showStatus && <react_native_1.View style={{ position: "absolute", backgroundColor: "black", opacity: 0.6, width: 100, margin: "auto", top: 12, left: 0, borderRadius: 8, right: 0, padding: 4 }}><react_native_1.Text style={{ width: "100%", textAlign: "center", color: "white" }}>Upvoted!</react_native_1.Text></react_native_1.View>}
                    <components_1.Button style={{ marginLeft: "auto", paddingHorizontal: 0 }} appearance={'ghost'} accessoryLeft={function (props) { return <images_1.CommentIcon height={24} width={24} style={{ height: 24, width: 24 }}/>; }}>-</components_1.Button>
                    {<components_1.Button style={{ paddingHorizontal: 0 }} onPress={function () {
                        if (!isUpvoted)
                            setShowStatus(true);
                        api_1.Api.Post.extensions.setUpvoted({
                            id: post._id,
                            is_upvoted: !isUpvoted // return number of upvotes. 
                        }).then(function (r) {
                            if (r.is_upvoted)
                                setTimeout(function () {
                                    setShowStatus(false);
                                }, 1333);
                            setIsUpvoted(r.is_upvoted);
                        });
                    }} accessoryLeft={function (props) { return <images_1.UpvoteIcon height={24} width={24} style={{ height: 24, width: 24, opacity: isUpvoted ? 1 : 0.25 }}/>; }} appearance={"ghost"}>{isUpvoted ? "1" : " "}</components_1.Button>}
                </react_native_1.View>}
        </react_native_1.View>
    </react_native_1.View>;
}
exports.PostView = PostView;
var SubstackView = function (props) {
    var post = props.post;
    return <react_native_1.View style={{ marginVertical: style_1.sizes.rem1, marginHorizontal: style_1.sizes.rem0_5 }}>
        <react_native_1.View key="profile">
            {/* <Image style={{ aspectRatio: 0.9, marginRight: sizes.rem1 / 2 }} source={{ uri: post.platform_profile_url }} /> */}
            <react_native_1.Pressable onPress={function () {
            react_native_1.Linking.openURL(post._source.postUrl);
        }} style={{ marginBottom: style_1.sizes.rem1, display: "flex", flexDirection: "row" }}>
                <IconfiyIcon_1.IconifyIcon style={{ width: 30, height: 30, marginTop: 2, marginRight: style_1.sizes.rem1 / 1.5 }} svgProps={{ style: { margin: "auto" } }} icon={images_1.social.SubstackLogo} currentColor={style_2.social.substackColor}/>
                {<Headers_1.Subheader text={post._source.content.title || ""} style={{ display: "flex", color: "black", fontSize: style_1.fonts.medium, fontWeight: "600", fontFamily: "K2D", maxWidth: "85%" }}></Headers_1.Subheader>}
            </react_native_1.Pressable>
        </react_native_1.View>
        {<react_native_1.Text key="content" style={{ fontSize: style_1.fonts.small }}>{parseHtmlEnteties(post._source.content.description)}</react_native_1.Text>}
        {<react_native_1.Text key="date" style={{ fontSize: style_1.fonts.xSmall, fontFamily: "K2D", paddingVertical: 5 }}>{new Date(Date.parse(post._source.platformCreatedAt)).toLocaleString()}</react_native_1.Text>}
    </react_native_1.View>;
};
var parseHtmlEnteties = function (str) {
    return str.replace(/&#([0-9]{1,4});/gi, function (match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
};
var PostContentView = function (props) {
    var _a = (0, react_native_2.useWindowDimensions)(), windowWidth = _a.width, scale = _a.scale, availWidth = windowWidth - exports.spaceOnSide;
    if (props.post._source.postType === 'substack') {
        return SubstackView(props);
    }
    return <react_native_1.View>
        <react_native_1.View style={{ display: (props.post._source.postType === 'tweet' && props.post._source.content.body.slice(0, 2) === 'RT') ? 'flex' : 'none',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 2 }}>
            <images_1.Retweet style={{ width: 30, height: 30 }}/>
            <react_native_1.Text style={{ fontWeight: '500',
            marginLeft: 2 }}>
                {'Retweet'}
            </react_native_1.Text>
        </react_native_1.View>
        <HtmlView_1.HtmlView style={{ height: (0, exports.postInnerHeight)(props.post, availWidth), marginTop: props.post._source.postType === 'spotify' ? 8 : 0 }} isUrl={props.post._source.postType === "youtube" || props.post._source.postType === "spotify"}>
                {(0, exports.resolvePostContent)(props.post, availWidth)}
        </HtmlView_1.HtmlView>
    </react_native_1.View>;
};
