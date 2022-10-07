const jwt = require("jsonwebtoken")
const fs = require("fs");
const http2 = require('http2');
const f = fs.readFileSync("./AuthKey_LH8Y46Z2SG.p8", "utf8");
console.log(f)

const authorizationToken = jwt.sign(
    {
        iss: "25L2ZZWUPA",
        iat: Math.round(new Date().getTime() / 1000),
    },
    f,
    {
        header: {
            alg: "ES256",
            kid: "LH8Y46Z2SG",
        },
    }
);

(async () => {
    const IS_PRODUCTION = false;
    const nativeDeviceToken = "c75a0f402b10ba7750b1a6446fa8431ff1f890147e54d573eb774cad39e5e106";

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
                    title: "Sending Myself a Nice Notification",
                    body: 'Finally.....',
                },
            },
            // experienceId: 'dvbz/TradingPostExpo', // Required when testing in the Expo Go app
            // scopeKey: 'dvbz/TradingPostExpo', // Required when testing in the Expo Go app
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