import Extension from "./index";
export default class extends Extension {
    feed: (settings: {
        page: number;
    }) => Promise<any>;
}
