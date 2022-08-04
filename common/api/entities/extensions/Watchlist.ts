import Extension from ".";
import { AllWatchlists } from "../interfaces";

export default class extends Extension {
    getAllWatchlists = this._makeFetch<undefined, AllWatchlists>("getAllWatchlists", this._defaultPostRequest)
}