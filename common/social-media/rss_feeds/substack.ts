import Parser from 'rss-parser';
import {SubstackUser, SubstackFeed, SubstackArticles} from '../interfaces/rss_feeds';
import Repository from '../repository'


export class Substack {
    private repository: Repository;

    constructor(repository: Repository) {
        this.repository = repository
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

            count += await this.repository.insertSubstackUser(formatedUser);
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

        const success = await this.repository.insertSubstackArticles(formatedArticles);

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
}


