import { Extension } from "./index"

export type UploadProfilePicBody = { userId: string, image: string };

export default class User extends Extension {
    uploadProfilePic = this._makeFetch<UploadProfilePicBody>("uploadProfilePic", (s) => ({
        method: "POST",
        body: JSON.stringify(s)
    }))
    generateBrokerageLink = this._makeFetch<undefined, { link: string }>("generateBrokerageLink", (s) => ({
        method: "POST"
    }))

}

