import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "us-east-1"
});
const streamToString = (stream: any) =>
    new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

const s3Bucket = 'tradingpost-app-data'

const typeMainFeedQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/typeMainFeedQuery.json",
        }))).Body))()
const typeUserQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/typeUserQuery.json",
        }))).Body))()
const typeSearchSubQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/typeSearchSubQuery.json",
        }))).Body))()
const typeSearchQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/typeSearchQuery.json",
        }))).Body))()
const platformQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/platformQueryv3.json",
        }))).Body))()
const platformQueryParameters = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/platformQueryParametersv1.json",
        }))).Body))()
const feedQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/feedv9.json",
        }))).Body))()


const bookmarkQuery = (bookmarkItems: string[]) => {
    return {
        bool: {
            must: [
                {
                    terms: {
                        _id: bookmarkItems
                    }
                },
                {
                    exists: {
                        "field": "size"
                    }
                }]
        }
    }
}


const insertParamsIntoTemplate = (template: string, data: Record<string, any>) => {

    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;

        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array) && !(dataToReplace instanceof Object))
            throw new Error("Invalid data passed to query template");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))

    });
    return JSON.parse(queryString);
}

const createPlatformQueryByType = async (template: string, templateData: any, selectedPlatforms: string[]) => {
    let platformQueries: any[] = [];
    const platformParameters = JSON.parse(await platformQueryParameters);
    const allPlatforms = Object.keys(platformParameters);

    for (let d of (selectedPlatforms.length ? selectedPlatforms : allPlatforms)) {
        d = d === 'Twitter' ? 'tweet' : d;

        const typeSpecificQuery = insertParamsIntoTemplate(template, {platform: d.toLocaleLowerCase(), ...templateData});
        const platformQueryPart = insertParamsIntoTemplate(await platformQueryTemplate, {
            typeSpecificQuery,
            ...templateData,
            platformOrigin: platformParameters[d.toLocaleLowerCase()].origin,
            platformScale: platformParameters[d.toLocaleLowerCase()].scale,
            platformWeight: platformParameters[d.toLocaleLowerCase()].weight
        });
        platformQueries.push(platformQueryPart);
    }
    return platformQueries;
}
export const createQueryByType = async (type: string, data: any) => {
    const selectedPlatforms = data.selectedPlatforms || []
    const beginDateTime = (data.beginDateTime ? new Date(data.beginDateTime) : new Date('1/1/2000')).toISOString();
    const endDateTime = (data.endDateTime ? new Date(data.endDateTime) : new Date(Date.now())).toISOString();
    const subscriptions = data.subscriptions || []
    const blocks = data.blocks || []
    const templateData = {
        subscriptions,
        blocks
    }

    if (type === 'postIds') {
        return bookmarkQuery(data.postIds)
    } else if (type === 'user') {
        const platformQueries = await createPlatformQueryByType(await typeUserQueryTemplate, {user_id: data.user_id, ...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        })
    } else if (type === 'search') {
        const searchSubQuery: string[] = []
        data.searchTerms.forEach(async (el: string) => {
            searchSubQuery.push(insertParamsIntoTemplate(await typeSearchSubQueryTemplate, {searchTerm: el}))
        })
        const platformQueries = await createPlatformQueryByType(await typeSearchQueryTemplate, {typeSearchSubQuery: searchSubQuery, ...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        })
    } else {
        const platformQueries = await createPlatformQueryByType(await typeMainFeedQueryTemplate, {...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        })
    }
}