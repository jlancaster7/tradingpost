import { DefaultConfig } from "../../../configuration";
import Extension from "./index";
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { IElasticPost, IElasticPostExt } from "../interfaces";
import { string } from "mathjs";

export default class extends Extension {
    // setPostsPerPage = (ppp: number) => {
    //     postsPerPage = ppp;
    // }

    // This needs to be decoupled in the future
    feed = this._makeFetch<{ page: number, userId?: string, bookmarkedOnly?: boolean, data?: Record<string, number | string | (number | string)[]> }, IElasticPostExt[]>("feed", (s) => ({
        body: JSON.stringify(s)
    }));
    multitermfeed = this._makeFetch<{ page: number,  data?: Record<string, number | string | (number | string)[]> }, IElasticPostExt[]>("multitermfeed", (s) => ({
        body: JSON.stringify(s)
    }));
    getUpvotes = this._makeFetch<{ id: string, count: number }>("getUpvotes", this._defaultPostRequest)
    setBookmarked = this._makeFetch<{ id: string, is_bookmarked: boolean }>("setBookmarked", this._defaultPostRequest)
    setUpvoted = this._makeFetch<{ id: string, is_upvoted: boolean, count: number }>("setUpvoted", this._defaultPostRequest)
    create = this._makeFetch<{ title: string, content: string, subscription_level: string, width: number, height: number }, {}>("create", this._defaultPostRequest)
}