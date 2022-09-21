"use strict";
exports.__esModule = true;
exports.PostScreen = void 0;
var react_1 = require("react");
var PostView_1 = require("../components/PostView");
function PostScreen(props) {
    return <PostView_1.PostView post={props.route.params.post}/>;
}
exports.PostScreen = PostScreen;
