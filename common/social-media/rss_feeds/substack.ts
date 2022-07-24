import Parser from 'rss-parser';
import {SubstackUser, SubstackFeed, SubstackArticles} from '../interfaces/rss_feeds';
import {IDatabase, IMain} from "pg-promise";

export class Substack {
    private pg_client: IDatabase<any>;
    private pgp: IMain

    constructor(pg_client: IDatabase<any>, pgp: IMain) {
        this.pg_client = pg_client;
        this.pgp = pgp;
    }

    importUsers = async (username: string | string[]): Promise<[SubstackUser[], number]> => {
        if (typeof username === 'string') {
            username = [username]
        }

        let results = [];
        let data: SubstackFeed | undefined;
        let count = 0;
        let formatedUser: SubstackUser;
        for (let i = 0; i < username.length; i++) {
            data = await this.getUserFeed(username[i]);

            if (!data) {
                continue;
            }

            formatedUser = this.formatUser(data);

            count += await this.appendUser(formatedUser);
            results.push(formatedUser);
        }


        return [results, count];
    }

    importArticles = async (username: string): Promise<[SubstackArticles[], number]> => {
        const results = await this.getUserFeed(username);
        if (!results) {
            return [[], 0];
        }

        const formatedArticles = this.formatArticles(results);

        const success = await this.appendArticles(formatedArticles);

        return [formatedArticles, success];
    }

    getUserFeed = async (username: string): Promise<SubstackFeed | undefined> => {
        const parser = new Parser();

        try {
            const results = await parser.parseURL(`https://${username}.substack.com/feed`);
            results.username = username;
            return results as SubstackFeed;
        } catch (err) {
            console.log(`${username} appears to be an invalid Substack username.`)
            return;
        }
    }

    formatUser = (userFeed: SubstackFeed): SubstackUser => {
        const formatedUser: SubstackUser = {
            substack_user_id: userFeed.username,
            title: userFeed.title,
            description: userFeed.description,
            link: userFeed.link,
            language: userFeed.language,
            email: userFeed.webMaster,
            image: userFeed.image,
            itunes: userFeed.itunes,
            last_build_date: new Date(userFeed.lastBuildDate)
        }
        return formatedUser;
    }

    formatArticles = (userFeed: SubstackFeed): SubstackArticles[] => {
        const rawArticles = userFeed.items;
        let formatedArticles = [];
        let temp: SubstackArticles;
        for (let i = 0; i < rawArticles.length; i++) {
            if (!rawArticles[i].creator) {
                rawArticles[i].creator = '';
            }
            temp = {
                substack_user_id: userFeed.username,
                creator: rawArticles[i].creator,
                title: rawArticles[i].title,
                link: rawArticles[i].link,
                substack_created_at: new Date(rawArticles[i].pubDate),
                content_encoded: rawArticles[i]['content:encoded'],
                content_encoded_snippet: rawArticles[i]['content:encodedSnippet'],
                enclosure: JSON.stringify(rawArticles[i].enclosure),
                dc_creator: rawArticles[i]['dc:creator'],
                content: rawArticles[i].content,
                content_snippet: rawArticles[i].contentSnippet,
                article_id: rawArticles[i].guid,
                itunes: JSON.stringify(rawArticles[i].itunes)
            }
            formatedArticles.push(temp);
        }
        return formatedArticles;
    }

    appendUser = async (data: SubstackUser): Promise<number> => {
        let keys: string;
        let values: string[];
        let value_index: string;
        let query: string;
        let result;
        let success = 0;
        try {
            keys = Object.keys(data).join(' ,');
            values = Object.values(data);
            value_index = '';
            values.map((obj, index) => {
                value_index += `$${index + 1}, `;
            });
            value_index = value_index.substring(0, value_index.length - 2);
            query = `INSERT INTO substack_users(${keys})
                     VALUES (${value_index})
                     ON CONFLICT (substack_user_id) DO NOTHING`;
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            result = await this.pg_client.result(query, values);
            success += result.rowCount;
            return success;
        } catch (err) {
            return success;
        }
    }

    appendArticles = async (formattedArticles: SubstackArticles[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'substack_user_id', prop: 'substack_user_id'},
                {name: 'creator', prop: 'creator'},
                {name: 'title', prop: 'title'},
                {name: 'link', prop: 'link'},
                {name: 'substack_created_at', prop: 'substack_created_at'},
                {name: 'content_encoded', prop: 'content_encoded'},
                {name: 'content_encoded_snippet', prop: 'content_encoded_snippet'},
                {name: 'enclosure', prop: 'enclosure'},
                {name: 'dc_creator', prop: 'dc_creator'},
                {name: 'content', prop: 'content'},
                {name: 'content_snippet', prop: 'content_snippet'},
                {name: 'article_id', prop: 'article_id'},
                {name: 'itunes', prop: 'itunes'},
            ], {table: 'substack_articles'});

            const query = this.pgp.helpers.insert(formattedArticles, cs) + ' ON CONFLICT DO NOTHING';
            return (await this.pg_client.result(query)).rowCount;
        } catch (err) {
            throw err;
        }
    }
}


