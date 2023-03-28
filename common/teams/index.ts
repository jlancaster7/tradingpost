import fetch from 'node-fetch';
import {DefaultConfig} from "../configuration/index";
// Webhook Url Below

export const alert = async (alertText: string) => {
    const teams = await DefaultConfig.fromCacheOrSSM("teams")
    const res = await fetch(teams.alertChannel, {
        method: 'POST',
        body: JSON.stringify({
            text: alertText
        })
    });
}
