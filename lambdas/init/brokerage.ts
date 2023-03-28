import {DefaultConfig} from "@tradingpost/common/configuration/index";
import {default as FinicityApi} from "@tradingpost/common/finicity";

let finicity: FinicityApi;

export const brokerageInit = async (tokenFile?: string) => {
    if (finicity) return {finicity}
    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');

    finicity = new FinicityApi(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey, tokenFile);
    await finicity.init();

    return {finicity}
}