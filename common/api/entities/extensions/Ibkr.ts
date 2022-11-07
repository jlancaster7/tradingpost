import Extension from "./";


export default class extends Extension {
    
    insertNewAccounts = this._makeFetch<{account_ids: string[]}, {}>("insertNewAccounts", this._defaultPostRequest)

}