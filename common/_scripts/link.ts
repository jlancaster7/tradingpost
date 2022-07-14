import packageInfo from '../package.json'
import { execAsync } from './util';
import { join } from 'path'
//import { promisify } from 'util'

//npm version <update_type>
(async () => {
    try {

        const commonRoot = join(__dirname, "..");
        //await execAsync('tsc -b ' + commonRoot);
        //await execAsync(`npm pack ${commonRoot}`);
        await execAsync(`npm uninstall @tradingpost/common`);
        await execAsync(`npm install ${commonRoot}`);

        console.log(`The version: ${packageInfo.version} of common has been linked!`);
    }
    catch (ex) {
        console.error(ex);
    }
})()


