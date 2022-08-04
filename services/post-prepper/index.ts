process.env.CONFIGURATION_ENV = 'production'

//import express from 'express'
import { Pool } from 'pg'
import { DefaultConfig } from '@tradingpost/common/configuration';
import { Client } from '@elastic/elasticsearch'
import { Interface } from '@tradingpost/common/api'
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { IElasticPost } from '@tradingpost/common/api/entities/interfaces';

const totalSize = 5000;
const batchSize = 1;
const maxJobs = 20;
const maxWidthSetting = 400;
let jobs: Promise<{ batch: any[], sizes: Record<string, string> }>[] = [];

(async () => {
    const elasticConfig = await DefaultConfig.fromCacheOrSSM("elastic")
    const dbConfig = await DefaultConfig.fromCacheOrSSM("postgres")
    const pool = new Pool(dbConfig);
    const elastic = new Client({
        cloud: {
            id: elasticConfig['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfig['apiKey'] as string
        },
        maxRetries: 5,
    });
    const indexName = "tradingpost-search";



    const browser = await puppeteer.launch();

    const resulty = await elastic.search<Interface.IElasticPost["_source"]>({
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


    })
    //console.log("DOCS ORIGINAL " + JSON.stringify(resulty.hits.hits));
    let lastIndex = 0;
    const scriptTag = "<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>";

    let pageCount = -1;
    while (lastIndex < Math.min(totalSize, resulty.hits.hits.length)) {
        pageCount++;

        console.log(`FROM ITEM ${lastIndex} TO ITEM ${Math.min(lastIndex + batchSize, resulty.hits.hits.length)}`);
        const batch = resulty.hits.hits.slice(lastIndex, Math.min(lastIndex + batchSize, resulty.hits.hits.length));

        lastIndex = lastIndex + batchSize;
        const page = await browser.newPage();



        //"<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"

        const pageContent = `<html><body><div style="width:${maxWidthSetting}px;">${batch.map((h) =>
            `<div class="tracker" data-tracker-id="${h._id}">${h._source?.content.htmlBody.replace(scriptTag, "")}</div>`
        ).join("\r\n")}</div></body>${(batch[0]._source?.postType === "tweet" ? `<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>` : "")
            }</html>`;

        writeFileSync(`output/page${pageCount}.html`, pageContent);


        console.log("Setting Content Load");

        jobs.push((async () => {

            const whenLoaded = new Promise((res) => {
                page.on("load", () => {
                    res("loaded");
                })
            })
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
            await page.setContent(pageContent, {
                waitUntil: "networkidle0",
            });
            await whenLoaded;

            //await reqTracker;
            //console.log("Adding Script Tag");
            // await page.addScriptTag({
            //     url: "",
            // });


            console.log("Evaluating Magic");

            const begin = Date.now();
            const sizes =
                batch[0]._source?.postType === "substack" || batch[0]._source?.postType === "tweet" ?
                    await new Promise<Record<string, string>>((resolve, reject) => {
                        //One day we could use every event to make sure everythign is done without doing a queryselector check and timeout
                        let tryCount = 40;

                        const checkCompletion = async () => {
                            tryCount--;
                            const doneCount = await page.evaluate(() => {

                                let doneCount: Record<string, string> = {};
                                document.querySelectorAll(".tracker").forEach((tracker) => {
                                    const trackerId = (tracker as HTMLDivElement).dataset.trackerId as string;
                                    const tp = trackerId.split("_")[0];
                                    if (tp === "twitter") {
                                        const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                                        if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                                            doneCount[trackerId] = frame.style.height;
                                        }
                                    }
                                    else if (tp === "substack") {
                                        return doneCount[trackerId] = String(tracker.getBoundingClientRect().height)
                                    }
                                });
                                return doneCount;
                            })
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
                        }
                        checkCompletion();

                    }) : {};

            console.log(JSON.stringify(sizes));
            console.log(`Batch Done in ${(Date.now() - begin) / 1000}s`);
            page.close();

            return {
                batch,
                sizes
            };
        })())

        if (jobs.length === maxJobs) {
            await new Promise((resolve) => {
                const interval = setInterval(async () => {
                    const jobResults = await Promise.all(jobs);
                    const ops = jobResults.flatMap((batches, i) => {
                        {
                            //const index = Number(doc.split("-").pop());
                            return batches.batch.flatMap((d) => {
                                const curItem = batches.sizes[d._id] || "-1px";
                                if (curItem === "-1px") {
                                    console.warn(`Doc ::${d._id} did not process a size`)
                                }
                                const pt = (d as IElasticPost)._source.postType;

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
                                                            return maxWidthSetting / Number(curItem.replace("px", ""))
                                                        case "youtube":
                                                            return 390 / 230;
                                                        case "spotify":
                                                            return 360 / 162
                                                        default:
                                                            return 1;
                                                    }
                                                })()
                                            }
                                        }
                                    }
                                ]
                            });
                        }
                    });

                    console.log("Printing Ops");
                    console.log(JSON.stringify(ops));
                    const res = await elastic.bulk({
                        index: indexName,
                        operations: ops
                    })

                    jobs.splice(0, jobs.length);
                    clearInterval(interval);
                    resolve(true);
                }, 500)
            });
        }
    }
    if (jobs.length) {
        const jobResults = await Promise.all(jobs);
        const ops = jobResults.flatMap((batches, i) => {
            {
                //const index = Number(doc.split("-").pop());
                return batches.batch.flatMap((d) => {
                    const curItem = batches.sizes[d._id] || "-1px";
                    if (curItem === "-1px") {
                        console.warn(`Doc ::${d._id} did not process a size`)
                    }

                    const pt = (d as IElasticPost)._source.postType;


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
                                                return maxWidthSetting / Number(curItem.replace("px", ""))
                                            case "youtube":
                                                return 390 / 230;
                                            case "spotify":
                                                return 360 / 162
                                            default:
                                                return 1;
                                        }
                                    })()
                                }
                            }
                        }
                    ]
                });
            }
        });
        console.log("Printing Ops");
        console.log(JSON.stringify(ops));
        const res = await elastic.bulk({
            index: indexName,
            operations: ops
        })
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

})()

