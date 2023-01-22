import Extension from ".";
import { ICommentPlus } from "./Comment.server";
export default class extends Extension {
    postList: (settings: {
        type: string;
        id: string;
    }) => Promise<ICommentPlus[]>;
}
