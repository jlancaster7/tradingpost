import { execVerboseAsync, logs, spawnVerbose, waitUntilVerbose, removeSpawnPrc } from '../../../../utilities/exec-async'
import { join } from 'path'
import { rootRepo } from './misc';
import 'dotenv/config'
import { createInterface } from 'readline';
import fetch from 'node-fetch';
// import term from 'terminate'
//This is something
const config = (() => {
    const validConfigs = ["LOCAL", "DEV", "TEST"] as const;
    const config = process.argv[2]?.toUpperCase() || "DEV";
    if (!validConfigs.find(t => t === config))
        throw new Error(`Unknown configuration type ${config}. Only the following values are supported : ${validConfigs.join("|")} `)
    else
        return config as typeof validConfigs[number]
})()

const startApiServer = function* () {
    console.log("HIIIIIII")
    let proc: ReturnType<typeof spawnVerbose> | undefined;
    while (true)
        yield (async () => {
            if (proc) {
                removeSpawnPrc("api");
                logKey = "main";
            }

            proc = spawnVerbose("Starting Api Server", "api", `npm run start --prefix ${join(rootRepo, "services", "api")}`, {
                env: {
                    PORT: process.env.API_PORT,
                    "postgres": (() => {
                        if (config === "LOCAL") {
                            if (!process.env.postgres)
                                throw new Error("'postgres' envrionmental variable must be configured to run LOCAL config.");
                            return process.env.postgres
                        }
                        else
                            return undefined
                    })()
                }
            })
            await waitUntilVerbose("Api Server has been started", async () => {
                try {
                    return (await fetch("http://localhost:" + process.env.API_PORT)).ok
                } catch (ex) {
                    return false;
                }
            },{maxRetries: 10, retryInterval:2000});
            return proc;
        })()
}()

const printHelp = (forceMain?: boolean) => {
    const log = logs[forceMain ? "main" : logKey]

    log.push("####################################################################\r\n")
    log.push("############################### HELP ###############################\r\n")
    log.push("####################################################################\r\n")
    log.push("~Available Logs - Type the name of a long and hit return to switch to it\r\n")
    log.push("~Commands\r\n")
    Object.keys(logs).forEach((lk) => {
        log.push(lk + "\r\n");
    })
    log.push("~Commands\r\n")
    if (logKey === "api\r\n")
        log.push("(r)estart API Server\r\n")
    log.push("(h)elp\r\n")
    log.push("(q)uit\r\n")

    log.push("####################################################################\r\n")
}

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

let lastLogLength = 0;
let logKey = "main";
const keepReading = () => {
    rl.question('>', function (key) {
        if (key.length === 1) {
            switch (key) {
                case "r":
                    if (logKey === "api") {
                        startApiServer.next();
                    }
                case "h":
                    printHelp();
                case "q":
                    rl.close();
                    process.exit(0);
                    break;
            }
        }
        else {
            const log = logs[key];
            if (log) {
                logKey = key;
                lastLogLength = 0;
            }
            else {
                console.log(">>>>Unknown Log:" + key);
            }
        }
        keepReading();
    });
}
keepReading();
rl.on('close', function () {
    console.log('\nBYE BYE !!!');
    process.exit(0);
});

setInterval(() => {
    const log = logs[logKey];
    if (lastLogLength === 0)
        console.clear();
    if (lastLogLength !== log.length) {
        console.log(log.slice(lastLogLength, log.length).join(""));
        lastLogLength = log.length;
        process.stdout.write(">");
    }
}, 1000);

logs.main.push(`Launching TradingPost App in mode:${"WEB"} with configuration:${config}`);

(async () => {

    spawnVerbose("Starting Common Watcher...", "common", "npm run watch --prefix " + join(rootRepo, "common"));
    await execVerboseAsync("Linking Api Server To Common...", "npm run link-common  --prefix " + join(rootRepo, "services", "api"));

    await startApiServer.next().value;
    await execVerboseAsync("Uninstall Common from TradingPost App", "npm uninstall @tradingpost/common")
    config === "TEST" ?
        await execVerboseAsync("Installing Common to TradingPost App", "npm install @tradingpost/common") :
        await execVerboseAsync("Linking Common to TradingPost App", "npm run link-common")

    await spawnVerbose("Starting TradingPost App", "app", "npm run web" + (config === "TEST" ? " --no-dev --minify" : ""));
    logs.main.push("Trading Post App Has Started!!!!!")
    printHelp();

})()









