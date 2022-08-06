import {google} from 'googleapis';
import Repository from '../repository';
import { PlatformToken } from '../interfaces/utils';
import url from 'url';

export class YoutubeAuth {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private oauth2Client: any;
    private authorizationUrl: string;
    private repository: Repository;

    constructor(repository: Repository, clientId: string, clientSecret: string, redirectUri: string) {
        this.repository = repository;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.oauth2Client = new google.auth.OAuth2({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUri: this.redirectUri
        });
        const scopes = [
        'https://www.googleapis.com/auth/youtube.readonly'
        ];
        this.authorizationUrl = this.oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true
        });
    }
    getAuthUrl = () => {
        return this.authorizationUrl;
    }
    authCodetoTokens = (req: any) => {
        let q = url.parse(req.url, true).query;
    
        // Get access and refresh tokens (if access_type is offline)
        // @ts-ignore
        let {tokens} = await oauth2Client.getToken(q.code);

        this.repository.upsertUserTokens(tokens);
    }
    getAuthClient = (tokens: PlatformToken) => {
        
    }
}