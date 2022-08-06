import http from 'http';
import url from 'url';
import fetch from 'node-fetch';
import {google} from 'googleapis';
process.env.CONFIGURATION_ENV = 'production';
import {DefaultConfig} from "../../configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import { importYoutubeUsersByToken } from './import';

const redirectUri = 'http://localhost:19006';

(async () => {
    let pgClient: IDatabase<any>;
    let pgp: IMain;
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    pgp = pgPromise({});
    pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()
    const youtubeConfiguration = await DefaultConfig.fromCacheOrSSM("youtube");
    const oauth2Client = new google.auth.OAuth2({
        clientId: youtubeConfiguration.client_id,
        clientSecret: youtubeConfiguration.client_secret,
        redirectUri: redirectUri
    });
    const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly'
    ];
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
    });
    let server = http.createServer(async function (req, res) {   //create web server
        console.log(req.url);
        if (req.url == '/') { //check the URL of the current request
            // set response header
            res.writeHead(301, { "Location": authorizationUrl });
            res.end();
        }
        if(req.url!.startsWith('/?code')) {
            
            // @ts-ignore
            let q = url.parse(req.url, true).query.code;

            const baseUrl = 'https://oauth2.googleapis.com/token'
            const params = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: youtubeConfiguration.client_id,
                    client_secret: youtubeConfiguration.client_secret,
                    code: q,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri
                })
            }
            //let {tokens} = await oauth2Client.getToken(q.code);
            const tokens = await (await fetch(baseUrl, params)).json();

            const user = await importYoutubeUsersByToken({userId: 'a71912d5-d505-4b88-a1af-c36f610be84d',
                                                          accessToken: tokens.access_token,
                                                          refreshToken: tokens.refresh_token,
                                                          expiration: tokens.expires_in
                                                          },
                                                          pgClient, 
                                                          pgp, 
                                                          youtubeConfiguration
                                                          )
            console.log(user);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`<html><body><p>${tokens}</p></body></html>`);
            //oauth2Client.setCredentials(tokens);
            res.end();

        }
    })
    server.listen(19006); //6 - listen for any incoming requests
    
    console.log('Node.js web server at port 19006 is running..')
})()
