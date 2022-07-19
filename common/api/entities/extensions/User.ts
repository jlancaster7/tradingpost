import { Extension } from "./index"
import { EntityApiBase } from "../static/EntityApiBase";


export type UploadProfilePicBody = { userId: string, image: string };

export default class User extends Extension {
    uploadProfilePic = this._makeFetch<UploadProfilePicBody>("uploadProfilePic", (s) => ({
        method: "POST",
        body: JSON.stringify(s)
    }))
}

