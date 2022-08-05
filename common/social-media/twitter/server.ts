process.env.CONFIGURATION_ENV = 'production'
import randomstring from "randomstring";
import fetch from 'node-fetch';
import crypto from "crypto";
import base64url from "base64url";
import http from 'http';
import url from 'url';
import { addTwitterUsersByToken } from ".";
import {DefaultConfig} from "../../configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";




const redirectUri = 'http://localhost:19006/auth/twitter';

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
    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const codeVerifier = randomstring.generate(100);
    const base64Digest = crypto.createHash("sha256")
                               .update(codeVerifier)
                               .digest("base64");
    
    const codeChallenge = base64url.fromBase64(base64Digest);
    const searchParams = new URLSearchParams({
        response_type: 'code',
        client_id: twitterConfiguration.client_id,
        //redirect_uri: redirectUri,
        //scope: 'tweet.read,users.read,offline.access',
        state: codeVerifier,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    })
    let authorizationUrl = `https://twitter.com/i/oauth2/authorize?` + searchParams + `&scope=tweet.read%20users.read%20offline.access&redirect_uri=${redirectUri}`;
    console.log(authorizationUrl);
    
    let server = http.createServer(async function (req, res) {   //create web server
        if (req.url == '/') { //check the URL of the current request
            // set response header
            
            res.writeHead(301, { "Location": authorizationUrl });
            res.end();
        }
        if(req.url!.startsWith('/auth/twitter')) {
            //console.log(url.parse(req.url!));
            // @ts-ignore

            let q = url.parse(req.url, true).query;
            
            const params = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: q.code as string,
                    grant_type: 'authorization_code',
                    client_id: twitterConfiguration.client_id,
                    code_verifier: q.state as string,
                    redirect_uri: redirectUri
                })
            }
            const response = await fetch('https://api.twitter.com/2/oauth2/token', params);

            const tokens = await response.json();
            // Get access and refresh tokens (if access_type is offline)
            const addUser = await addTwitterUsersByToken({userId: 'a71912d5-d505-4b88-a1af-c36f610be84d', 
                                                          accessToken: tokens.access_token, 
                                                          refreshToken: tokens.refresh_token, 
                                                          expiration: tokens.expires_in},
                                                          pgClient,
                                                          pgp,
                                                          twitterConfiguration);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`<html><body><p>complete</p></body></html>`);
            res.end();

        }
    })
    server.listen(19006); //6 - listen for any incoming requests
    
    console.log('Node.js web server at port 19006 is running..');
})()