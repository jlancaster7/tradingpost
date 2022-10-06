const jwt = require("jsonwebtoken")
const fs = require("fs");
const http2 = require('http2');


const authorizationToken = jwt.sign(
    {
        iss: "25L2ZZWUPA",
        iat: Math.round(new Date().getTime() / 1000),
    },
    fs.readFileSync("./AuthKey_LH8Y46Z2SG.p8", "utf8"),
    {
        header: {
            alg: "ES256",
            kid: "LH8Y46Z2SG",
        },
    }
);

(async () => {
    const IS_PRODUCTION = false;
    const nativeDeviceToken = "a6a6f41e68b8135a555a292458cd1caaf1e2e19ca625fe99a88038bfbe34d8e3";

    const client = http2.connect(
        IS_PRODUCTION ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com'
    );

    const request = client.request({
        ':method': 'POST',
        ':scheme': 'https',
        'apns-topic': 'com.tradingpostapp',
        ':path': '/3/device/' + nativeDeviceToken, // This is the native device token you grabbed client-side
        authorization: `bearer ${authorizationToken}`, // This is the JSON web token we generated in the "Authorization" step above
    });
    request.setEncoding('utf8');

    request.write(
        JSON.stringify({
            aps: {
                alert: {
                    title: "📧 You've got mail!",
                    body: 'Hello world! 🌐',
                },
            },
            experienceId: '@yourExpoUsername/yourProjectSlug', // Required when testing in the Expo Go app
            scopeKey: '@yourExpoUsername/yourProjectSlug', // Required when testing in the Expo Go app
        })
    );

    // @ts-ignore
    request.on('response', (headers, flags) => {
        for (const name in headers) {
            console.log(`${name}: ${headers[name]}`);
        }
    });

    let data = '';
    // @ts-ignore
    request.on('data', chunk => {
        data += chunk;
    });

    request.on('end', () => {
        console.log(`\n${data}`);
        client.close();
    });

    request.end();
    request.end();
})()

// (async () => {
//     const options = {
//         token: {
//             key: 'AuthKey_LH8Y46Z2SG.p8',
//             keyId: 'LH8Y46Z2SG',
//             teamId: '25L2ZZWUPA',
//         }
//     };
//
//     const apnProvider = new apn.Provider(options);
//     const note = new apn.Notification();
//     note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
//     note.badge = 3;
//     note.sound = "ping.aiff";
//     note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
//     note.payload = {'messageFrom': 'John Appleseed'};
//     note.topic = "com.tradingpostapp";
//     const t = "c75a0f402b10ba7750b1a6446fa8431ff1f890147e54d573eb774cad39e5e106"
//     const res = await apnProvider.send(note, t)
//     console.log(res.failed);
// })();