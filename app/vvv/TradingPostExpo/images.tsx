import _IconNoBg from './assets/store-front-logo2-alt.svg'
import _IconBg from './assets/store-front.svg'
import _AppTitle from './assets/app-title.svg'
import _SplashWelcome from './assets/splash-welcome.svg'
import _ClimbingMountain from './assets/ClimbingMountain.svg'
import _Debate from './assets/Debate.svg'
import _Studying from './assets/Studying.svg'
import _Analyze from './assets/analyze.svg'
import _Bank from './assets/bank.svg'
import _IBKR from './assets/IBKR.svg'
import _RobinhoodLogo from './assets/robinhood_logo.svg'
import _RobinhoodLogoLong from './assets/robinhood_logo_long.svg'
import _DownTriangle from './assets/downTriangle.svg'
import _UpTriangle from './assets/upTriangle.svg'

import Logo from './assets/logo.svg'
import LogoNoBg from './assets/logo-no-bg.svg'

import _PlusIcon from './assets/misc/plus.svg';
import _UpvoteIcon from './assets/post-feed/upvote.svg'
import _CommentIcon from './assets/post-feed/comment.svg'
import _BookmarkActive from './assets/post-feed/bookmark-active.svg'
import _BookmarkActiveBlue from './assets/post-feed/bookmark-active-blue.svg'
import _BookmarkInactive from './assets/post-feed/bookmark.svg'
import _Retweet from './assets/post-feed/ei_retweet.svg'
import _PremiumStar from './assets/post-feed/PremiumStar.svg'
import _SendIcon from './assets/post-feed/SendIcon.svg'
import _ErrorIcon from './assets/post-feed/material-symbols_error-circle-rounded-outline.svg'
import _EllipsesIcon from './assets/post-feed/ph_dots-three-bold.svg'


// /** Side Menu Icons */
import Account from './assets/side-menu/Account.svg'
import Competition from './assets/side-menu/Competition.svg'
import Feedback from './assets/side-menu/Feedback.svg'
import Help from './assets/side-menu/Help.svg'
import Information from './assets/side-menu/Information.svg'
import Learn from './assets/side-menu/Learn.svg'
import LogOut from './assets/side-menu/Log Out.svg'
import Profile from './assets/side-menu/Profile.svg'
import Watchlist from './assets/side-menu/Watchlist.svg'
import Bank_Link from './assets/bank-link-icon.svg'

import YouTubeLogo from './assets/@iconify/youtube-icon'
import SpotifyLogo from './assets/@iconify/spotify-icon'

import TwitterLogo from './assets/@iconify/twitter'

import LinkedInLogo from './assets/@iconify/linkedin-icon'

import SubstackLogo from './assets/@iconify/substack'

import React, {Component} from 'react'
import {SvgExpo} from './components/SvgExpo'
import {SvgProps} from 'react-native-svg'

export const sideMenu = {
    Account,
    Competition,
    Feedback,
    Information,
    Help,
    Learn,
    LogOut,
    Profile,
    Watchlist,
    Bank_Link,
    BookmarkActive: _BookmarkActive,
    BookmarkInactive: _BookmarkInactive,
    BookmarkActiveBlue: _BookmarkActiveBlue
}

function makeExpoSvg(Svg: React.FC<SvgProps>) {
    return (props: SvgProps & { onReady?: (parent: any) => void }) => <SvgExpo {...props}><Svg/></SvgExpo>
}

export const AppTitle = makeExpoSvg(_AppTitle)
export const SplashWelcome = makeExpoSvg(_SplashWelcome)

export const ClimbingMountain = makeExpoSvg(_ClimbingMountain)
export const Debate = makeExpoSvg(_Debate)
export const Studying = makeExpoSvg(_Studying)
export const Analyze = makeExpoSvg(_Analyze);
export const Bank = makeExpoSvg(_Bank);
export const IBKR = makeExpoSvg(_IBKR);
export const RobinhoodLogo = makeExpoSvg(_RobinhoodLogo);
export const RobinhoodLogoLong = makeExpoSvg(_RobinhoodLogoLong);
export const UpTriangle = makeExpoSvg(_UpTriangle);
export const DownTriangle = makeExpoSvg(_DownTriangle);
//export const Bank_Link = makeExpoSvg(_Bank_Link);

export const IconBg = makeExpoSvg(_IconBg)
export const IconNoBg = makeExpoSvg(_IconNoBg)
export const PlusIcon = makeExpoSvg(_PlusIcon)
export const Retweet = makeExpoSvg(_Retweet);


// IconBg,
// IconNoBg,
// MenuIcon,
// PlusIcon,
export const UpvoteIcon = makeExpoSvg(_UpvoteIcon);
export const CommentIcon = makeExpoSvg(_CommentIcon);
export const SendIcon = makeExpoSvg(_SendIcon);
export const InfoIcon = makeExpoSvg(Information);
export const BookmarkActive = makeExpoSvg(_BookmarkActive);
export const BookmarkActiveBlue = makeExpoSvg(_BookmarkActiveBlue);
export const PremiumStar = makeExpoSvg(_PremiumStar);
export const ErrorIcon = makeExpoSvg(_ErrorIcon);

export const EllipsesIcon = makeExpoSvg(_EllipsesIcon);

export {Logo, LogoNoBg};


export const rnui = {
    chevronDown: require('./assets/rnui/chevronDown.png'),
    add: require('./assets/rnui/add.png'),
    plus: require('./assets/rnui/plus.png')
}
export type NavIconKeys = "Portfolio" | "Search" | "Feed" | "Notification"; //| "Bookmark";

export const NavIconTypeOverride: Partial<Record<NavIconKeys, any>> = {
    Notification: {
        no: {
            active: require('./assets/nav-bar/notification-active.png'),
            inactive: require('./assets/nav-bar/notification.png'),
        },
        has: {
            active: require('./assets/nav-bar/has-notification-active.png'),
            inactive: require('./assets/nav-bar/has-notification.png')
        }
    }
}

export const navIcons: Record<NavIconKeys, { active: number, inactive: number }> = {
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
    },
}

export const BookmarkIcons = {
    active: require("./assets/nav-bar/bookmark-active.png"),
    inactive: require("./assets/nav-bar/bookmark.png")
}


export const topBarIcons = {
    menu: require('./assets/nav-bar/menu.png')
}

export const social = {
    TwitterLogo,
    LinkedInLogo,
    YouTubeLogo,
    SubstackLogo,
    SpotifyLogo,
    //TradingPostLogo: LogoNoBg
}


export const postBg = require("./assets/post-feed/flatgrad.png");