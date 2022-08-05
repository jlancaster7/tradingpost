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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.CONFIGURATION_ENV = 'production';
//import express from 'express'
const pg_1 = require("pg");
const configuration_1 = require("@tradingpost/common/configuration");
const elasticsearch_1 = require("@elastic/elasticsearch");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = require("fs");
const totalSize = 5000;
const batchSize = 1;
const maxJobs = 20;
const maxWidthSetting = 400;
let jobs = [];
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const elasticConfig = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
    const dbConfig = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pool = new pg_1.Pool(dbConfig);
    const elastic = new elasticsearch_1.Client({
        cloud: {
            id: elasticConfig['cloudId']
        },
        auth: {
            apiKey: elasticConfig['apiKey']
        },
        maxRetries: 5,
    });
    const indexName = "tradingpost-search";
    const browser = yield puppeteer_1.default.launch();
    const resulty = yield elastic.search({
        index: indexName,
        size: totalSize,
        from: 0,
        query: {
            // ids: {
            //     values: ['twitter_1527623632150839297']
            // },
            bool: {
                must_not: {
                    exists: {
                        field: "size"
                    }
                }
            }
        }
    });
    //console.log("DOCS ORIGINAL " + JSON.stringify(resulty.hits.hits));
    let lastIndex = 0;
    const scriptTag = "<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>";
    let pageCount = -1;
    while (lastIndex < Math.min(totalSize, resulty.hits.hits.length)) {
        pageCount++;
        console.log(`FROM ITEM ${lastIndex} TO ITEM ${Math.min(lastIndex + batchSize, resulty.hits.hits.length)}`);
        const batch = resulty.hits.hits.slice(lastIndex, Math.min(lastIndex + batchSize, resulty.hits.hits.length));
        lastIndex = lastIndex + batchSize;
        const page = yield browser.newPage();
        //"<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"
        const pageContent = `<html><body><div style="width:${maxWidthSetting}px;">${batch.map((h) => { var _a; return `<div class="tracker" data-tracker-id="${h._id}">${(_a = h._source) === null || _a === void 0 ? void 0 : _a.content.htmlBody.replace(scriptTag, "")}</div>`; }).join("\r\n")}</div></body>${(((_a = batch[0]._source) === null || _a === void 0 ? void 0 : _a.postType) === "tweet" ? `<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>` : "")}</html>`;
        (0, fs_1.writeFileSync)(`output/page${pageCount}.html`, pageContent);
        console.log("Setting Content Load");
        jobs.push((() => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            const whenLoaded = new Promise((res) => {
                page.on("load", () => {
                    res("loaded");
                });
            });
            // const reqTracker = new Promise((res) => {
            //     let lastTimeout: any
            //     page.on("request", (ev) => {
            //         if (lastTimeout)
            //             clearTimeout(lastTimeout);
            //         lastTimeout = setTimeout(() => {
            //             console.log("DONE WITH REQUESTS!!!!");
            //             res(true);
            //         }, 5000)
            //         console.log(ev.url());
            //     })
            // });
            yield page.setContent(pageContent, {
                waitUntil: "networkidle0",
            });
            yield whenLoaded;
            //await reqTracker;
            //console.log("Adding Script Tag");
            // await page.addScriptTag({
            //     url: "",
            // });
            console.log("Evaluating Magic");
            const begin = Date.now();
            const sizes = ((_b = batch[0]._source) === null || _b === void 0 ? void 0 : _b.postType) === "substack" || ((_c = batch[0]._source) === null || _c === void 0 ? void 0 : _c.postType) === "tweet" ?
                yield new Promise((resolve, reject) => {
                    //One day we could use every event to make sure everythign is done without doing a queryselector check and timeout
                    let tryCount = 40;
                    const checkCompletion = () => __awaiter(void 0, void 0, void 0, function* () {
                        tryCount--;
                        const doneCount = yield page.evaluate(() => {
                            let doneCount = {};
                            document.querySelectorAll(".tracker").forEach((tracker) => {
                                const trackerId = tracker.dataset.trackerId;
                                const tp = trackerId.split("_")[0];
                                if (tp === "twitter") {
                                    const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                                    if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                                        doneCount[trackerId] = frame.style.height;
                                    }
                                }
                                else if (tp === "substack") {
                                    return doneCount[trackerId] = String(tracker.getBoundingClientRect().height);
                                }
                            });
                            return doneCount;
                        });
                        // if () {
                        //     resolve(doneCount);
                        //     //reject(new Error("Out of tries. Process took too long to finish"));
                        // }
                        if (tryCount === 0 || Object.keys(doneCount).length === batch.length) {
                            resolve(doneCount);
                        }
                        else {
                            //console.log("NOT DONE::::" + Object.keys(doneCount).length + " vs." + batch.length)
                            setTimeout(() => checkCompletion(), 500);
                        }
                    });
                    checkCompletion();
                }) : {};
            console.log(JSON.stringify(sizes));
            console.log(`Batch Done in ${(Date.now() - begin) / 1000}s`);
            page.close();
            return {
                batch,
                sizes
            };
        }))());
        if (jobs.length === maxJobs) {
            yield new Promise((resolve) => {
                const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                    const jobResults = yield Promise.all(jobs);
                    const ops = jobResults.flatMap((batches, i) => {
                        {
                            //const index = Number(doc.split("-").pop());
                            return batches.batch.flatMap((d) => {
                                const curItem = batches.sizes[d._id] || "-1px";
                                if (curItem === "-1px") {
                                    console.warn(`Doc ::${d._id} did not process a size`);
                                }
                                const pt = d._source.postType;
                                return [
                                    { update: { _id: d._id } },
                                    {
                                        doc: {
                                            size: {
                                                maxWidth: maxWidthSetting,
                                                aspectRatio: (() => {
                                                    switch (pt) {
                                                        case "tweet":
                                                        case "substack":
                                                            return maxWidthSetting / Number(curItem.replace("px", ""));
                                                        case "youtube":
                                                            return 390 / 230;
                                                        case "spotify":
                                                            return 360 / 162;
                                                        default:
                                                            return 1;
                                                    }
                                                })()
                                            }
                                        }
                                    }
                                ];
                            });
                        }
                    });
                    console.log("Printing Ops");
                    console.log(JSON.stringify(ops));
                    const res = yield elastic.bulk({
                        index: indexName,
                        operations: ops
                    });
                    jobs.splice(0, jobs.length);
                    clearInterval(interval);
                    resolve(true);
                }), 500);
            });
        }
    }
    if (jobs.length) {
        const jobResults = yield Promise.all(jobs);
        const ops = jobResults.flatMap((batches, i) => {
            {
                //const index = Number(doc.split("-").pop());
                return batches.batch.flatMap((d) => {
                    const curItem = batches.sizes[d._id] || "-1px";
                    if (curItem === "-1px") {
                        console.warn(`Doc ::${d._id} did not process a size`);
                    }
                    const pt = d._source.postType;
                    return [
                        { update: { _id: d._id } },
                        {
                            doc: {
                                size: {
                                    maxWidth: maxWidthSetting,
                                    aspectRatio: (() => {
                                        switch (pt) {
                                            case "tweet":
                                            case "substack":
                                                return maxWidthSetting / Number(curItem.replace("px", ""));
                                            case "youtube":
                                                return 390 / 230;
                                            case "spotify":
                                                return 360 / 162;
                                            default:
                                                return 1;
                                        }
                                    })()
                                }
                            }
                        }
                    ];
                });
            }
        });
        console.log("Printing Ops");
        console.log(JSON.stringify(ops));
        const res = yield elastic.bulk({
            index: indexName,
            operations: ops
        });
    }
    browser.close();
    // await new Promise((res) => {
    //     setTimeout(() => res(null), 1000);
    // })
    // const countDone = await elastic.count({
    //     index: indexName,
    //     query: {
    //         bool: {
    //             must: {
    //                 exists: {
    //                     field: "size"
    //                 }
    //             }
    //         }
    //     }
    // });
    // const countem = await elastic.count({
    //     index: indexName,
    //     query: {
    //         bool: {
    //             must_not: {
    //                 exists: {
    //                     field: "size"
    //                 }
    //             },
    //             must: {
    //                 match: {
    //                     postType: "tweet"
    //                 }
    //             }
    //         }
    //     }
    // });
    // console.log(`####CURRENT COUNT:::: ${countDone.count} vs. ${countem.count}.`)
    //        if (countem.count <= 0)
    // await elastic.helpers.bulk(
    //     {
    //         index: indexName,
    //         refreshOnCompletion: true,
    //         datasource: Object.keys(sizes),
    //         onDocument: (doc) =>,
    //         onDrop(doc) {
    //             console.log("DROPPPED:::" + doc);
    //         },
    //     });
    //console.log(JSON.stringify(aggs.aggregations));
    //console.log(JSON.stringify(result.hits.hits));
}))();
