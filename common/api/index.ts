import Auth from './entities/static/AuthApi'
import Security from './entities/static/SecurityApi'
import Alert from './entities/apis/AlertApi'
import Audio from './entities/apis/AudioApi'
import BlockList from './entities/apis/BlockListApi'
import Bookmark from './entities/apis/BookmarkApi'
import Brokerage from './entities/apis/BrokerageApi'
import Comment from './entities/apis/CommentApi'
import Ibkr from './entities/apis/IbkrApi'
import Notification from './entities/apis/NotificationApi'
import NotificationSubscription from './entities/apis/NotificationSubscriptionApi'
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
export * as Interface from './entities/interfaces'
export const Api:{ 
Alert: typeof Alert,Audio: typeof Audio,BlockList: typeof BlockList,Bookmark: typeof Bookmark,Brokerage: typeof Brokerage,Comment: typeof Comment,Ibkr: typeof Ibkr,Notification: typeof Notification,NotificationSubscription: typeof NotificationSubscription,PlatformClaim: typeof PlatformClaim,Post: typeof Post,Subscriber: typeof Subscriber,Subscription: typeof Subscription,Trade: typeof Trade,Upvote: typeof Upvote,User: typeof User,Watchlist: typeof Watchlist,WatchlistItem: typeof WatchlistItem,WatchlistSaved: typeof WatchlistSaved,
Auth: typeof Auth,Security: typeof Security
}
 = {
Alert,Audio,BlockList,Bookmark,Brokerage,Comment,Ibkr,Notification,NotificationSubscription,PlatformClaim,Post,Subscriber,Subscription,Trade,Upvote,User,Watchlist,WatchlistItem,WatchlistSaved,
Auth,Security
}