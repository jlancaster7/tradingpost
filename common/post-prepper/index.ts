import {Browser} from "puppeteer";
import {sleep} from "../utils/sleep";

const MAX_WIDTH = 400;

type SizeResponse = {
    maxWidth: number
    aspectRatio: number
}

export default class PostPrepper {
    private browser: Browser | undefined = undefined;
    private twitterScriptTag: string = "<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>";

    constructor() {
    }

    init = async (puppeteerBrowser?: Browser): Promise<void> => {
        if (this.browser) return;
        if (puppeteerBrowser) {
            this.browser = puppeteerBrowser;
            console.log("Setting Browser :D !")
            return
        }

        const pup = await require('puppeteer');
        this.browser = await pup.launch()
    }

    cleanup = async (): Promise<void> => {
        if (!this.browser) return;
        await this.browser.close()
    }

    twitter = async (html: string): Promise<SizeResponse> => {
        if (this.browser === undefined) throw new Error("post-prepper not inited");
        const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="tweet-tracker">
                        ${html.replace(this.twitterScriptTag, "")}</div>
                    </div>
                    </body>
                    ${this.twitterScriptTag}
                </html>`;

        const page = await this.browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36')
        const whenLoaded = new Promise((res) => {
            page.on("load", () => {
                res("loaded")
            })
        });
        await page.setContent(pageContent, {waitUntil: "networkidle0"});
        await whenLoaded;
        const size = await new Promise<string>(async (resolve, reject) => {
            let tryCount = 20;
            for (let i = 0; i < tryCount; i++) {
                const size = await page.evaluate(() => {
                    let response = {trackerId: '', size: '0px'}
                    document.querySelectorAll(".tracker").forEach((tracker) => {
                        const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                        if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                            response.size = frame.style.height;
                            return response
                        }
                        return response
                    });
                    return response;
                });
                if (size.size !== '0px' && size.size !== '0') {
                    resolve(size.size)
                    return
                }
                await sleep(200)
            }
            resolve('0px')
        });
        await page.close()
        const height = parseInt(size.replace('px', ''));
        return {
            maxWidth: MAX_WIDTH,
            aspectRatio: height
        }
    }

    tradingpost = async (html: string): Promise<SizeResponse> => {
        if (this.browser === undefined) throw new Error("post-prepper not inited");
        const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="tweet-tracker">
                        ${html.replace(this.twitterScriptTag, "")}</div>
                    </div>
                    </body>
                    ${this.twitterScriptTag}
                </html>`;

        const page = await this.browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36')
        const whenLoaded = new Promise((res) => {
            page.on("load", () => {
                res("loaded")
            })
        });
        await page.setContent(pageContent, {waitUntil: "networkidle0"});
        await whenLoaded;
        const size = await new Promise<string>(async (resolve, reject) => {
            let tryCount = 20;
            for (let i = 0; i < tryCount; i++) {
                const size = await page.evaluate(() => {
                    let response = {trackerId: '', size: '0px'}
                    document.querySelectorAll(".tracker").forEach((tracker) => {
                        const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                        if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                            response.size = frame.style.height;
                            return response
                        }
                        return response
                    });
                    return response;
                });
                if (size.size !== '0px' && size.size !== '0') {
                    resolve(size.size)
                    return
                }
                await sleep(200)
            }
            resolve('0px')
        });
        await page.close()
        const height = parseInt(size.replace('px', ''));
        return {
            maxWidth: MAX_WIDTH,
            aspectRatio: height
        }
    }

    substack = async (html: string): Promise<SizeResponse> => {
        if (this.browser === undefined) throw new Error("post-prepper not inited");
        const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="substack-tracker">
                        ${html}</div>
                    </div>
                    </body>
                </html>`;

        const page = await this.browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36')
        const whenLoaded = new Promise((res) => {
            page.on("load", () => {
                res("loaded")
            })
        });
        await page.setContent(pageContent, {waitUntil: "networkidle0"});
        await whenLoaded;
        const size = await new Promise<string>(async (resolve, reject) => {
            let tryCount = 40;
            for (let i = 0; i < tryCount; i++) {
                const size = await page.evaluate(() => {
                    let response = {trackerId: '', size: '0px'}
                    document.querySelectorAll(".tracker").forEach((tracker) => {
                        response.size = String(tracker.getBoundingClientRect().height)
                        return response;
                    });
                    return response;
                });

                if (size.size !== '0px' && size.size !== '0') {
                    resolve(size.size)
                    return
                }

                await sleep(200)
            }
            resolve('0px')
        });

        await page.close()
        const height = parseInt(size.replace('px', ''));

        return {
            maxWidth: MAX_WIDTH,
            aspectRatio: height
        }
    }
}
