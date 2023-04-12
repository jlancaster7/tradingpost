import {alert} from "../teams/index";
import fetch from 'node-fetch';

export const api = async (): Promise<Boolean> => {
    const response = await fetch("https://api.tradingpostapp.com/");
    if (response.status !== 200) {
        await alert("TradingPost API Is Down...!")
        return false
    }

    return true;
}