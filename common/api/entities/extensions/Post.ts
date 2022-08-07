import { DefaultConfig } from "../../../configuration";
import Extension from "./index";
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { IElasticPost, IElasticPostExt } from "../interfaces";


export default class extends Extension {
    // setPostsPerPage = (ppp: number) => {
    //     postsPerPage = ppp;
    // }

    // This needs to be decoupled in the future
    feed = this._makeFetch<{ page: number,  userId?:string, bookmarkedOnly?: boolean, data?: Record<string, number | string | (number | string)[]> }, IElasticPostExt[]>("feed", (s) => ({
        body: JSON.stringify(s)
    }));
    setBookmarked = this._makeFetch<{ id: string, is_bookmarked: boolean }>("setBookmarked", this._defaultPostRequest)
    setUpvoted = this._makeFetch<{ id: string, is_upvoted: boolean }>("setUpvoted", this._defaultPostRequest)
}