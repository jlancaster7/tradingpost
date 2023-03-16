"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sleep_1 = require("../utils/sleep");
const MAX_WIDTH = 400;
class PostPrepper {
    constructor() {
        this.browser = undefined;
        this.twitterScriptTag = "<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>";
        this.init = (puppeteerBrowser) => __awaiter(this, void 0, void 0, function* () {
            if (this.browser)
                return;
            if (puppeteerBrowser) {
                this.browser = puppeteerBrowser;
                return;
            }
            const pup = yield require('puppeteer');
            this.browser = yield pup.launch();
        });
        this.cleanup = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.browser)
                return;
            yield this.browser.close();
        });
        this.twitter = (html) => __awaiter(this, void 0, void 0, function* () {
            if (this.browser === undefined)
                throw new Error("post-prepper not inited");
            const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="tweet-tracker">
                        ${html.replace(this.twitterScriptTag, "")}</div>
                    </div>
                    </body>
                    ${this.twitterScriptTag}
                </html>`;
            const page = yield this.browser.newPage();
            yield page.setDefaultNavigationTimeout(0);
            yield page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36');
            const whenLoaded = new Promise((res) => {
                page.on("load", () => {
                    res("loaded");
                });
            });
            yield page.setContent(pageContent, { waitUntil: "networkidle0" });
            yield whenLoaded;
            const size = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let tryCount = 20;
                for (let i = 0; i < tryCount; i++) {
                    const size = yield page.evaluate(() => {
                        let response = { trackerId: '', size: '0px' };
                        document.querySelectorAll(".tracker").forEach((tracker) => {
                            const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                            if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                                response.size = frame.style.height;
                                return response;
                            }
                            return response;
                        });
                        return response;
                    });
                    if (size.size !== '0px' && size.size !== '0') {
                        resolve(size.size);
                        return;
                    }
                    yield (0, sleep_1.sleep)(200);
                }
                resolve('0px');
            }));
            yield page.close();
            const height = parseInt(size.replace('px', ''));
            return {
                maxWidth: MAX_WIDTH,
                aspectRatio: height
            };
        });
        this.tradingpost = (html) => __awaiter(this, void 0, void 0, function* () {
            if (this.browser === undefined)
                throw new Error("post-prepper not inited");
            const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="tweet-tracker">
                        ${html.replace(this.twitterScriptTag, "")}</div>
                    </div>
                    </body>
                    ${this.twitterScriptTag}
                </html>`;
            const page = yield this.browser.newPage();
            yield page.setDefaultNavigationTimeout(0);
            yield page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36');
            const whenLoaded = new Promise((res) => {
                page.on("load", () => {
                    res("loaded");
                });
            });
            yield page.setContent(pageContent, { waitUntil: "networkidle0" });
            yield whenLoaded;
            const size = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let tryCount = 20;
                for (let i = 0; i < tryCount; i++) {
                    const size = yield page.evaluate(() => {
                        let response = { trackerId: '', size: '0px' };
                        document.querySelectorAll(".tracker").forEach((tracker) => {
                            const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                            if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                                response.size = frame.style.height;
                                return response;
                            }
                            return response;
                        });
                        return response;
                    });
                    if (size.size !== '0px' && size.size !== '0') {
                        resolve(size.size);
                        return;
                    }
                    yield (0, sleep_1.sleep)(200);
                }
                resolve('0px');
            }));
            yield page.close();
            const height = parseInt(size.replace('px', ''));
            return {
                maxWidth: MAX_WIDTH,
                aspectRatio: height
            };
        });
        this.substack = (html) => __awaiter(this, void 0, void 0, function* () {
            if (this.browser === undefined)
                throw new Error("post-prepper not inited");
            const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="substack-tracker">
                        ${html}</div>
                    </div>
                    </body>
                </html>`;
            const page = yield this.browser.newPage();
            yield page.setDefaultNavigationTimeout(0);
            yield page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36');
            const whenLoaded = new Promise((res) => {
                page.on("load", () => {
                    res("loaded");
                });
            });
            yield page.setContent(pageContent, { waitUntil: "networkidle0" });
            yield whenLoaded;
            const size = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let tryCount = 40;
                for (let i = 0; i < tryCount; i++) {
                    const size = yield page.evaluate(() => {
                        let response = { trackerId: '', size: '0px' };
                        document.querySelectorAll(".tracker").forEach((tracker) => {
                            response.size = String(tracker.getBoundingClientRect().height);
                            return response;
                        });
                        return response;
                    });
                    if (size.size !== '0px' && size.size !== '0') {
                        resolve(size.size);
                        return;
                    }
                    yield (0, sleep_1.sleep)(200);
                }
                resolve('0px');
            }));
            yield page.close();
            const height = parseInt(size.replace('px', ''));
            return {
                maxWidth: MAX_WIDTH,
                aspectRatio: height
            };
        });
    }
}
exports.default = PostPrepper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLDBDQUFxQztBQUVyQyxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFPdEIsTUFBcUIsV0FBVztJQUk1QjtRQUhRLFlBQU8sR0FBd0IsU0FBUyxDQUFDO1FBQ3pDLHFCQUFnQixHQUFXLDJGQUEyRixDQUFDO1FBSy9ILFNBQUksR0FBRyxDQUFPLGdCQUEwQixFQUFpQixFQUFFO1lBQ3ZELElBQUksSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTztZQUN6QixJQUFJLGdCQUFnQixFQUFFO2dCQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDO2dCQUNoQyxPQUFNO2FBQ1Q7WUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO1FBRUQsWUFBTyxHQUFHLEdBQXdCLEVBQUU7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU87WUFDMUIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsWUFBTyxHQUFHLENBQU8sSUFBWSxFQUF5QixFQUFFO1lBQ3BELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUMzRSxNQUFNLFdBQVcsR0FBRyxpQ0FBaUMsU0FBUzs7MEJBRTVDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQzs7O3NCQUczQyxJQUFJLENBQUMsZ0JBQWdCO3dCQUNuQixDQUFDO1lBRWpCLE1BQU0s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