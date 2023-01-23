import { Browser } from "puppeteer";
type SizeResponse = {
    maxWidth: number;
    aspectRatio: number;
};
export default class PostPrepper {
    private browser;
    private twitterScriptTag;
    constructor();
    init: (puppeteerBrowser?: Browser) => Promise<void>;
    cleanup: () => Promise<void>;
    twitter: (html: string) => Promise<SizeResponse>;
    tradingpost: (html: string) => Promise<SizeResponse>;
    substack: (html: string) => Promise<SizeResponse>;
}
export {};
