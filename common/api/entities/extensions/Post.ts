import { DefaultConfig } from "../../../configuration";
import Extension from "./index";
import { Client as ElasticClient } from '@elastic/elasticsearch';


export default class extends Extension {
    // setPostsPerPage = (ppp: number) => {
    //     postsPerPage = ppp;
    // }
    feed = this._makeFetch<{ page: number }>("feed", (s) => ({
        body: JSON.stringify(s)
    }))
}