import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import { DefaultConfig } from '@tradingpost/common/configuration';
import { sendByTemplate } from '@tradingpost/common/sendGrid';
import { AccountInfo } from './interfaces';
import Repository from './repository';
import jwt from 'jsonwebtoken'

export class GPTAccount {
    repo: Repository;
    constructor (repo: Repository) {
        this.repo = repo
    }
    deleteLogin = async (email: string) => {
        await this.repo.deleteLogin(email);
    }
    createAccount = async (data: {
        email: string,
        first_name: string,
        last_name: string,
        handle: string,
        dummy: boolean
    }) => {
        const [newUser] = await this.repo.createUser(data);
        const authKey = await DefaultConfig.fromCacheOrSSM("authkey");

        const token = jwt.sign({}, authKey, { subject: newUser.user_id });
        return {
            verified: false,
            token,
            user_id: newUser.user_id
        }
    }
    getAccountInfo = async (userId: string): Promise<AccountInfo> => {
        const user = await this.repo.getTradingPostUser(userId);
        const tokensUsed = await this.repo.getTokensused(userId);
        return {
            userId: userId,
            userName: user.handle,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            tokensUsed: tokensUsed,
            totalTokens: 20
        }
    }
    verifyAccount = async (verificationToken: string) => {
        const data = jwt.verify(verificationToken, await DefaultConfig.fromCacheOrSSM("authkey")) as jwt.JwtPayload;
        if (!data.sub) throw new Error("Invalid verification token!");
        
        await this.repo.verifyToken(data?.sub);
    }
    sendVerificationEmail = async (userId: string, email: string) => {
        const authKey = await DefaultConfig.fromCacheOrSSM("authkey");

        const token = jwt.sign({ verified: true }, authKey, { subject: userId });

        await sendByTemplate({
            to: email,
            templateId: "d-23c8fc09ded942d386d7c888a95a0653",
            dynamicTemplateData: {
                Weblink: 'http://localhost:3000' + `/chatGPT/verifyAccount?token=${token}`
            }
        })
    }
}