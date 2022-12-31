import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import { AccountInfo } from './interfaces';
import Repository from './repository';

export class GPTAccount {
    repo: Repository;
    constructor (repo: Repository) {
        this.repo = repo
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
}