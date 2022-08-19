import Parser from 'rss-parser';
import {SubstackUser, SubstackFeed, SubstackArticles} from '../interfaces/rss_feeds';
import Repository from '../repository'
import PostPrepper from "../../post-prepper/index";

export class Substack {
    private repository: Repository;

    constructor(repository: Repository) {
        this.repository = repository
    }

    importUsers = async (substackUser: { userId: string, username: string }): Promise<[SubstackUser, number]> => {

        let results = [];
        let data: SubstackFeed | undefined;
        let count = 0;

        let formatedUser: SubstackUser;

        data = await this.getUserFeed(substackUser.username);
        if (!data) {
            throw new Error(`Substack user: ${substackUser.username} for userId: ${substackUser.userId} was not found`);

        }
        const token = {
            userId: substackUser.userId,
            platform: 'substack',
            platformUserId: substackUser.username,
            accessToken: null,
            refreshToken: null,
            expiration: null,
            updatedAt: new Date()
        }
        formatedUser = this.formatUser(data);
        let dummyTokens = (await this.repository.getTokens('platform_user_id', [token.platformUserId], 'substack'));
        if (dummyTokens.length && substackUser.userId !== dummyTokens[0].userId) {
            const dummyCheck = await this.repository.isUserIdDummy(dummyTokens[0].userId);
            if (dummyCheck) {
                await this.repository.mergeDummyAccounts({
                    newUserId: substackUser.userId,
                    dummyUserId: dummyTokens[0].userId
                });
            } else {
                throw new Error("This account is claimed by another non-dummy user.");
            }
        }
        await this.repository.upsertUserTokens(token);
        count = await this.repository.insertSubstackUser(formatedUser);

        return [formatedUser, count];
    }

    importArticles = async (username: string): Promise<[SubstackArticles[], number]> => {
        const postPrepper = new PostPrepper();
        await postPrepper.init();

        const results = await this.getUserFeed(username);
        if (!results) {
            return [[], 0];
        }

        const formatedArticles = await this.formatArticles(results);
        for (let i = 0; i < formatedArticles.length; i++) {
            const {maxWidth, aspectRatio} = await postPrepper.substack(formatedArticles[i].content_encoded);
            formatedArticles[i].max_width = maxWidth;
            formatedArticles[i].aspect_ratio = aspectRatio
        }

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

    formatArticles = async (userFeed: SubstackFeed): Promise<SubstackArticles[]> => {
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
                itunes: JSON.stringify(rawArticles[i].itunes),
                aspect_ratio: 0,
                max_width: 0
            }
            formatedArticles.push(temp);
        }
        return formatedArticles;
    }
}


