"use strict";
exports.__esModule = true;
exports.postBg = exports.social = exports.topBarIcons = exports.BookmarkIcons = exports.navIcons = exports.rnui = exports.LogoNoBg = exports.Logo = exports.BookmarkActiveBlue = exports.BookmarkActive = exports.CommentIcon = exports.UpvoteIcon = exports.Retweet = exports.PlusIcon = exports.IconNoBg = exports.IconBg = exports.SplashWelcome = exports.AppTitle = exports.sideMenu = void 0;
var store_front_logo2_alt_svg_1 = require("./assets/store-front-logo2-alt.svg");
var store_front_svg_1 = require("./assets/store-front.svg");
var app_title_svg_1 = require("./assets/app-title.svg");
var splash_welcome_svg_1 = require("./assets/splash-welcome.svg");
var logo_svg_1 = require("./assets/logo.svg");
exports.Logo = logo_svg_1["default"];
var logo_no_bg_svg_1 = require("./assets/logo-no-bg.svg");
exports.LogoNoBg = logo_no_bg_svg_1["default"];
// import MenuIcon from './assets/side-menu/menu-icon.svg';
var plus_svg_1 = require("./assets/misc/plus.svg");
var upvote_svg_1 = require("./assets/post-feed/upvote.svg");
var comment_svg_1 = require("./assets/post-feed/comment.svg");
var bookmark_active_svg_1 = require("./assets/post-feed/bookmark-active.svg");
var bookmark_active_blue_svg_1 = require("./assets/post-feed/bookmark-active-blue.svg");
var bookmark_svg_1 = require("./assets/post-feed/bookmark.svg");
var ei_retweet_svg_1 = require("./assets/post-feed/ei_retweet.svg");
// /** Side Menu Icons */
var Account_svg_1 = require("./assets/side-menu/Account.svg");
var Competition_svg_1 = require("./assets/side-menu/Competition.svg");
var Feedback_svg_1 = require("./assets/side-menu/Feedback.svg");
var Help_svg_1 = require("./assets/side-menu/Help.svg");
var Learn_svg_1 = require("./assets/side-menu/Learn.svg");
var Log_Out_svg_1 = require("./assets/side-menu/Log Out.svg");
var Profile_svg_1 = require("./assets/side-menu/Profile.svg");
var Watchlist_svg_1 = require("./assets/side-menu/Watchlist.svg");
var youtube_icon_1 = require("@iconify/icons-logos/youtube-icon");
var spotify_icon_1 = require("@iconify/icons-logos/spotify-icon");
var twitter_1 = require("@iconify/icons-logos/twitter");
var linkedin_icon_1 = require("@iconify/icons-logos/linkedin-icon");
var substack_1 = require("@iconify/icons-simple-icons/substack");
var react_1 = require("react");
var SvgExpo_1 = require("./components/SvgExpo");
exports.sideMenu = {
    Account: Account_svg_1["default"],
    Competition: Competition_svg_1["default"],
    Feedback: Feedback_svg_1["default"],
    Help: Help_svg_1["default"],
    Learn: Learn_svg_1["default"],
    LogOut: Log_Out_svg_1["default"],
    Profile: Profile_svg_1["default"],
    Watchlist: Watchlist_svg_1["default"],
    BookmarkActive: bookmark_active_svg_1["default"],
    BookmarkInactive: bookmark_svg_1["default"],
    BookmarkActiveBlue: bookmark_active_blue_svg_1["default"]
};
function makeExpoSvg(Svg) {
    return function (props) { return <SvgExpo_1.SvgExpo {...props}><Svg /></SvgExpo_1.SvgExpo>; };
}
exports.AppTitle = makeExpoSvg(app_title_svg_1["default"]);
exports.SplashWelcome = makeExpoSvg(splash_welcome_svg_1["default"]);
exports.IconBg = makeExpoSvg(store_front_svg_1["default"]);
exports.IconNoBg = makeExpoSvg(store_front_logo2_alt_svg_1["default"]);
exports.PlusIcon = makeExpoSvg(plus_svg_1["default"]);
exports.Retweet = makeExpoSvg(ei_retweet_svg_1["default"]);
// IconBg,
// IconNoBg,
// MenuIcon,
// PlusIcon,
exports.UpvoteIcon = makeExpoSvg(upvote_svg_1["default"]);
exports.CommentIcon = makeExpoSvg(comment_svg_1["default"]);
exports.BookmarkActive = makeExpoSvg(bookmark_active_svg_1["default"]);
exports.BookmarkActiveBlue = makeExpoSvg(bookmark_active_blue_svg_1["default"]);
exports.rnui = {
    chevronDown: require('./assets/rnui/chevronDown.png'),
    add: require('./assets/rnui/add.png'),
    plus: require('./assets/rnui/plus.png')
};
exports.navIcons = {
    "Portfolio": {
        active: require("./assets/nav-bar/portfolio-active.png"),
        inactive: require("./assets/nav-bar/portfolio.png")
    },
    "Feed": {
        active: require("./assets/nav-bar/feed-active.png"),
        inactive: require("./assets/nav-bar/feed.png")
    },
    "Search": {
        active: require("./assets/nav-bar/search-active.png"),
        inactive: require("./assets/nav-bar/search.png")
    },
    // "Bookmark": {
    //     active: require("./assets/nav-bar/bookmark-active.png"),
    //     inactive: require("./assets/nav-bar/bookmark.png")
    // },
    "Notification": {
        active: require("./assets/nav-bar/notification-active.png"),
        inactive: require("./assets/nav-bar/notification.png")
    }
};
exports.BookmarkIcons = {
    active: require("./assets/nav-bar/bookmark-active.png"),
    inactive: require("./assets/nav-bar/bookmark.png")
};
exports.topBarIcons = {
    menu: require('./assets/nav-bar/menu.png')
};
exports.social = {
    TwitterLogo: twitter_1["default"],
    LinkedInLogo: linkedin_icon_1["default"],
    YouTubeLogo: youtube_icon_1["default"],
    SubstackLogo: substack_1["default"],
    SpotifyLogo: spotify_icon_1["default"]
};
exports.postBg = require("./assets/post-feed/flatgrad.png");
