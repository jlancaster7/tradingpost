import packageInfo from '../package.json'
import { AutomationConfig } from '../configuration'
import { exec } from 'child_process';
import { execAsync } from './util';

//npm version <update_type>
(async () => {
    try {

        const npm_key = await AutomationConfig.fromSSM("npm_key");
        const [nodeCmd, filePath, versionUpdateType] = process.argv;
        if (!versionUpdateType) {
            throw new Error("Please provide a version update type (patch|minor|major)")
        }

        await execAsync('tsc');
        const versionNumber = await execAsync(`npm version ${versionUpdateType}`);
        await execAsync('npm publish', {
            env: {
                NPM_TOKEN: npm_key
            }
        });

        console.log(`Deployed Verions ${versionNumber} of common to NPM!`);

    }
    catch (ex) {
        console.error(ex);
        process.exit(-1);
    }
})()


