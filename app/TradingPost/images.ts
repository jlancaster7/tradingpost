import IconNoBg from './assets/store-front-logo2-alt.svg'
import IconBg from './assets/store-front.svg'
import AppTitle from './assets/app-title.svg'
import SplashWelcome from './assets/splash-welcome.svg'

import MenuIcon from './assets/side-menu/menu-icon.svg';
import PlusIcon from './assets/misc/plus.svg';
import UpvoteIcon from './assets/post-feed/upvote.svg'
import CommentIcon from './assets/post-feed/comment.svg'
import BookmarkActive from './assets/post-feed/bookmark-active.svg'

/** Side Menu Icons */
import Account from './assets/side-menu/Account.svg'
import Competition from './assets/side-menu/Competition.svg'
import Feedback from './assets/side-menu/Feedback.svg'
import Help from './assets/side-menu/Help.svg'
import Learn from './assets/side-menu/Learn.svg'
import LogOut from './assets/side-menu/Log Out.svg'
import Profile from './assets/side-menu/Profile.svg'
import Watchlist from './assets/side-menu/Watchlist.svg'

import YouTubeLogo from '@iconify/icons-logos/youtube-icon'
import TwitterLogo from '@iconify/icons-logos/twitter'
import LinkedInLogo from '@iconify/icons-logos/linkedin-icon'
import SubstackLogo from '@iconify/icons-simple-icons/substack'

export const sideMenu = {
    Account,
    Competition,
    Feedback,
    Help,
    Learn,
    LogOut,
    Profile,
    Watchlist
}



export {
    AppTitle,
    IconBg,
    IconNoBg,
    MenuIcon,
    PlusIcon,
    UpvoteIcon,
    CommentIcon,
    BookmarkActive,
    SplashWelcome
}





export const rnui = {
    chevronDown: require('./assets/rnui/chevronDown.png'),
    add: require('./assets/rnui/add.png'),
    plus: require('./assets/rnui/plus.png')
}
export type NavIconKeys = "Portfolio" | "Search" | "Feed" | "Bookmark" | "Notification";
export const navIcons: Record<NavIconKeys, { active: number, inactive: number }> = {
    "Portfolio": {
        active: require("./assets/nav-bar/portfolio-active.png"),
        inactive: require("./assets/nav-bar/portfolio.png")
    },
    "Search": {
        active: require("./assets/nav-bar/search-active.png"),
        inactive: require("./assets/nav-bar/search.png")
    },
    "Feed": {
        active: require("./assets/nav-bar/feed-active.png"),
        inactive: require("./assets/nav-bar/feed.png")
    },
    "Bookmark": {
        active: require("./assets/nav-bar/bookmark-active.png"),
        inactive: require("./assets/nav-bar/bookmark.png")
    },
    "Notification": {
        active: require("./assets/nav-bar/notification-active.png"),
        inactive: require("./assets/nav-bar/notification.png")
    },
}

export const topBarIcons = {
    menu: require('./assets/nav-bar/menu.png')
}

export const social = {
    TwitterLogo,
    LinkedInLogo,
    YouTubeLogo,
    SubstackLogo
}

export const postBg = require("./assets/post-feed/flatgrad.png");