import 'dotenv/config';
import {DefaultConfig} from '../configuration';
import puppeteer from 'puppeteer'
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {writeFileSync} from "fs";
import {sleep} from "../utils/sleep";

const MAX_WIDTH = 400;

let jobs: Promise<{ batch: any[], sizes: Record<string, string> }>[] = [];

// Goal is to update the database table with twitter id and height size for rendered element from the database
// We could do this in bulk which would speed up the process, or we could do it singularly within the job itself
// we use the database id prefaced with the name substack_ or twitter_ and then the record row # which we could then take and update
// and update the respective tables by that prepended key

const run = async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    })
    await pgClient.connect()

    const browser = await puppeteer.launch();

    const twitterScriptTag = "<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>";
    while (true) {
        const twitterTweets = await getTwitterTweets(pgClient);
        if (twitterTweets.length <= 0) break

        for (let i = 0; i < twitterTweets.length; i++) {
            const tweet = twitterTweets[i];
            jobs.push((async () => {
                const pageContent = `<html><body><div style="width:${MAX_WIDTH}px;">
                    <div class="tracker" data-tracker-id="${tweet.id}">
                        ${tweet.embed.replace(twitterScriptTag, "")}</div>
                    </div>
                    </body>
                    <script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>
                </html>`;

                writeFileSync(`output/output${tweet.id}.html`, pageContent)

                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0);
                // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36')

                const whenLoaded = new Promise((res) => {
                    page.on("load", () => {
                        res("loaded")
                    })
                });

                await page.setContent(pageContent, {waitUntil: "networkidle0"});
                await whenLoaded;

                const sizes = await new Promise<Record<string, string>>(async (resolve, reject) => {
                    let tryCount = 20;
                    for (let i = 0; i < tryCount; i++) {
                        const data = await page.evaluate(() => {
                            let response = {id: '', size: '0px'}
                            document.querySelectorAll(".tracker").forEach((tracker) => {
                                const trackerId = (tracker as HTMLDivElement).dataset.trackerId as string;
                                const tp = trackerId.split("_")[0];
                                response.id = trackerId
                                if (tp === "twitter") {
                                    const frame = tracker.querySelector('div.twitter-tweet-rendered iframe');
                                    if (frame instanceof HTMLIFrameElement && frame.style.height !== "0px") {
                                        response.size = frame.style.height;
                                        return response
                                    }
                                } else if (tp === "substack") {
                                    response.size = String(tracker.getBoundingClientRect().height)
                                    return response
                                }
                                return response
                            });

                            return response;
                        });

                        const {size, id} = data;

                        if (size !== '0px') {
                            console.log(`SET ID: ${tweet.id} TRY COUNT: ${i}`)
                            resolve({[id]: size})
                            return
                        }
                        await sleep(1000)
                    }

                    resolve({[tweet.id]: '0px'})
                });

                await page.close()
                return {
                    batch: [],
                    sizes: sizes
                }
            })())
        }

        console.log("Processing New Group")
        // let substackUpdate: { id: number, max_width: number, aspect_ratio: number }[] = [];
        let twitterUpdate: { id: number, max_width: number, aspect_ratio: number }[] = [];
        const results = await Promise.all(jobs);
        for (const result of results) {
            const keys = Object.keys(result.sizes);
            for (const key of keys) {
                const height = parseInt(result.sizes[key].replace('px', ''));
                const [serviceName, idStr] = key.split('_');
                const id = parseInt(idStr)
                const t = {id: id, max_width: MAX_WIDTH, aspect_ratio: height};
                if (serviceName === 'twitter') twitterUpdate.push(t)
                console.log(t)
                // if (serviceName === 'substack') substackUpdate.push({
                //     id: id,
                //     max_width: MAX_WIDTH,
                //     aspect_ratio: height
                // })
            }
        }

        // await bulkUpdateSubstack(pgClient, pgp, substackUpdate);
        await bulkUpdateTwitter(pgClient, pgp, twitterUpdate)
    }

    await browser.close();
    await pgp.end()
    console.log("Finished")
    return
}

type TwitterTweet = {
    id: string
    embed: string
}

type SubstackArticle = {
    id: string
    contentEncoded: string
}

const bulkUpdateTwitter = async (pgClient: IDatabase<any>, pgp: IMain, tweets: { id: number, max_width: number, aspect_ratio: number }[]) => {
    if (tweets.length <= 0) return
    const cs = new pgp.helpers.ColumnSet(['?id', 'max_width', 'aspect_ratio'], {table: 'tweets'});
    const query = pgp.helpers.update(tweets, cs) + ' WHERE v.id = t.id'
    await pgClient.none(query)
}

const bulkUpdateSubstack = async (pgClient: IDatabase<any>, pgp: IMain, articles: { id: number, max_width: number, aspect_ratio: number }[]) => {
    if (articles.length <= 0) return;
    const cs = new pgp.helpers.ColumnSet(['?id', 'max_width', 'aspect_ratio'], {table: 'substack_articles'});
    const query = pgp.helpers.update(articles, cs) + ' WHERE v.id = t.id';
    await pgClient.none(query);
}

const getTwitterTweets = async (pgClient: IDatabase<any>): Promise<TwitterTweet[]> => {
    const query = `
        SELECT id,
               embed
        FROM tweets
        WHERE max_width is null
        LIMIT 10;`;

    const response = await pgClient.query(query);
    if (response.length <= 0) return [];
    return response.map((row: any) => {
        let o: TwitterTweet = {
            id: `twitter_${row.id}`,
            embed: row.embed
        }
        return o
    });
}

const getSubstackArticles = async (pgClient: IDatabase<any>): Promise<SubstackArticle[]> => {
    const query = `
        SELECT id, content_encoded
        FROM SUBSTACK_ARTICLES SA
        WHERE MAX_WIDTH IS NULL
        LIMIT 100;`;

    const response = await pgClient.query(query);
    if (response.length <= 0) return [];
    return response.map((row: any) => {
        return {
            id: `substack_${row.id}`,
            contentEncoded: row.content_encoded
        }
    });
}

/**
 * TODO
 - Write Process to Update Current Twitter / Substack Aspect Ratios / MaxWidths
 - Update Social Media Ingestion Pipeline to include Twitter / Substack aspect ratio / max width processing
 - Deploy
 */
(async () => {
    await run()
})();