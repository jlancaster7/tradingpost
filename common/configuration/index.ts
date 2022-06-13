import {SSM} from 'aws-sdk';

export class Configuration {
    private ssmClient: SSM;

    constructor(ssmClient: SSM) {
        this.ssmClient = ssmClient;
    }

    fromSSM = async (path: string): Promise<Record<string, string | number | boolean>> => {
        try {
            const res = await this.ssmClient
                .getParameter({Name: path, WithDecryption: true})
                .promise();

            const parameter = res.Parameter;
            if (parameter === undefined) return {}
            if (parameter.Value === undefined) return {}

            return JSON.parse(parameter.Value);
        } catch (e) {
            throw e
        }
    }
}