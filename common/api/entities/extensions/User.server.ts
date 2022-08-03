import User, {UploadProfilePicBody} from "./User"
import {ensureServerExtensions} from "."
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import UserApi, {IUserUpdate} from '../apis/UserApi'
import FinicityService from '../../../brokerage/finicity'
import {DefaultConfig} from "../../../configuration";
import pgPromise from "pg-promise";
import Finicity from "../../../finicity";
import Repository from '../../../brokerage/repository'
import FinicityTransformer from '../../../brokerage/finicity/transformer'

const client = new S3Client({
    region: "us-east-1"
});

export default ensureServerExtensions<User>({
    generateBrokerageLink: async (req) => {
        const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
        const pgp = pgPromise({});
        const pgClient = pgp({
            host: pgCfg.host,
            user: pgCfg.user,
            password: pgCfg.password,
            database: pgCfg.database
        });

        await pgClient.connect();
        const repository = new Repository(pgClient, pgp);

        const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
        const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
        const repo = new Repository(pgClient, pgp);
        const finicityService = new FinicityService(finicity, repository, new FinicityTransformer(repo));
        return {
            link: finicityService.generateBrokerageAuthenticationLink(req.extra.userId)
        }

    },
    uploadProfilePic: async (req) => {
        const body = req.body as UploadProfilePicBody;
        if (req.extra.userId !== body.userId) {
            await client.send(new PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            await UserApi.update(body.userId, {
                has_profile_pic: true
            });
        } else
            throw {
                message: "Unathorized",
                code: 401
            }
    }
})