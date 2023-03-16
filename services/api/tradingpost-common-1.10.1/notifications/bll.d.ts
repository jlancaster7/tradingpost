import Notifications from "./";
import Repository from "./repository";
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { DateTime } from "luxon";
export declare const subscriptionsNewHoldings: (notifSrv: Notifications, repo: Repository) => Promise<void>;
export declare const holdingsPostNotifications: (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => Promise<void>;
export declare const watchlistsPostNotifications: (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => Promise<void>;
export declare const queryDatastore: (elasticClient: ElasticClient, userSubscriptions: string[], userBlockedList: string[], searchTerms: string[], endDateTime: DateTime, startDateTime: DateTime) => Promise<{
    postType: string;
    count: number;
}[]>;
