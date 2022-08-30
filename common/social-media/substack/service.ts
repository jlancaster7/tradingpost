import {SubstackAndNewsletter, SubstackAndNewsletterTable} from './interfaces';
import SubStack from './';
import Repository from '../repository';
import {IDatabase, IMain} from "pg-promise";
import PostPrepper from "../../post-prepper";
import ElasticService from "../../elastic";
import {SearchBody} from "../../models/elastic/search";

class SubstackService {
    private postPrepper: PostPrepper;
    private elasticSrv: ElasticService;
    private repository: Repository;
    private client: SubStack;

    constructor(client: SubStack, elasticSrv: ElasticService, repository: Repository, postPrepper: PostPrepper) {
        this.elasticSrv = elasticSrv;
        this.repository = repository;
        this.postPrepper = postPrepper;
        this.client = client;
    }

    importArticles = async (): Promise<void> => {
        const substackIds = await this.repository.getSubstackUsers();
        let articleIds: string[] = [];
        for (let i = 0; i < substackIds.length; i++) {
            const [results] = await this.client.importArticles(substackIds[i].substack_user_id);
            results.forEach(article => {
                articleIds.push(article.article_id)
            })
        }
        const articlesAndUsers = await this.repository.getSubstackArticlesAndUsersByArticleIds(articleIds);
        await this.elasticSrv.ingest(this.map(articlesAndUsers));
    }

    exportArticlesAndUsers = async (lastId: number): Promise<SubstackAndNewsletterTable[]> => {
        return await this.repository.getSubstackArticlesAndUsers(lastId);
    }

    importUsers = async (substackUsers: { userId: string, username: string }): Promise<void> => {
        const result = await this.client.importUsers(substackUsers);
        console.log(`Successfully imported ${substackUsers.username}Substack user for userId: ${substackUsers.username}.`)
    }

    map = (items: SubstackAndNewsletter[]): SearchBody[] => {
        return items.map((n: SubstackAndNewsletter) => {
            let obj: SearchBody = {
                id: `substack_${n.article_id}`,
                content: {
                    body: n.content_encoded_snippet,
                    description: n.content,
                    htmlBody: n.content_encoded,
                    htmlTitle: n.title,
                    title: n.title
                },
                imageUrl: n.newsletter_image.url,
                meta: {},
                platform: {
                    displayName: n.creator,
                    imageUrl: null,
                    profileUrl: n.newsletter_link,
                    username: null
                },
                platformCreatedAt: n.substack_article_created_at.toISO(),
                platformUpdatedAt: n.substack_article_created_at.toISO(),
                postType: "substack",
                postTypeValue: 3,
                postUrl: n.link,
                ratingsCount: 0,
                tradingpostCreatedAt: n.tradingpost_substack_article_created_at.toISO(),
                tradingpostUpdatedAt: n.tradingpost_substack_article_created_at.toISO(),
                size: {
                    maxWidth: n.maxWidth,
                    aspectRatio: n.aspectRatio,
                },
                user: {
                    id: n.tradingpostUserId,
                    imageUrl: n.tradingpostProfileUrl,
                    name: "",
                    type: "",
                    username: n.tradingpostUserHandle
                }
            };
            return obj;
        })
    }
}

export const DefaultSubstack = (pgClient: IDatabase<any>, pgp: IMain, postPrepper: PostPrepper, elastic: ElasticService): SubstackService => {
    const repo = new Repository(pgClient, pgp)
    const ss = new SubStack(repo, postPrepper);
    return new SubstackService(ss, elastic, repo, postPrepper);
}