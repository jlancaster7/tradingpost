import { DefaultConfig } from '../configuration'
import sendGrid from '@sendgrid/mail'

const defaultFrom = "no-reply@tradingpostapp.com"

export const sendByTemplate = async (config: {
    to: string,
    templateId: string,
    dynamicTemplateData: Record<string, any>,
    from?: string,
    apiKey?: string
}) => {
    const {
        to,
        from = defaultFrom,
        templateId,
        dynamicTemplateData,
        apiKey = (await DefaultConfig.fromCacheOrSSM("sendgrid")).key
    } = config
    sendGrid.setApiKey(apiKey);
    return sendGrid.send({
        to,
        from,
        templateId,
        dynamicTemplateData,
    })
}


