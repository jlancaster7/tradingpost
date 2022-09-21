import Auth from './entities/static/AuthApi'
import Security from './entities/static/SecurityApi'
import Alert from './entities/apis/AlertApi'
import Bookmark from './entities/apis/BookmarkApi'
import Comment from './entities/apis/CommentApi'
import PlatformClaim from './entities/apis/PlatformClaimApi'
import Post from './entities/apis/PostApi'
import Subscriber from './entities/apis/SubscriberApi'
import Subscription from './entities/apis/SubscriptionApi'
import Trade from './entities/apis/TradeApi'
import Upvote from './entities/apis/UpvoteApi'
import User from './entities/apis/UserApi'
import Watchlist from './entities/apis/WatchlistApi'
import WatchlistItem from './entities/apis/WatchlistItemApi'
import WatchlistSaved from './entities/apis/WatchlistSavedApi'
import * as Interface from './entities/interfaces'
export { Interface }
export const Api: {
    Alert: typeof Alert, Bookmark: typeof Bookmark, Comment: typeof Comment, PlatformClaim: typeof PlatformClaim, Post: typeof Post, Subscriber: typeof Subscriber, Subscription: typeof Subscription, Trade: typeof Trade, Upvote: typeof Upvote, User: typeof User, Watchlist: typeof Watchlist, WatchlistItem: typeof WatchlistItem, WatchlistSaved: typeof WatchlistSaved,
    Auth: typeof Auth, Security: typeof Security
}
    = {
    Alert, Bookmark, Comment, PlatformClaim, Post, Subscriber, Subscription, Trade, Upvote, User, Watchlist, WatchlistItem, WatchlistSaved,
    Auth, Security
}