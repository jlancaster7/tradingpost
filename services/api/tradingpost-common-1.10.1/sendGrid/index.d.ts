import sendGrid from '@sendgrid/mail';
export declare const sendByTemplate: (config: {
    to: string;
    templateId: string;
    dynamicTemplateData: Record<string, any>;
    from?: string;
    apiKey?: string;
}) => Promise<[sendGrid.ClientResponse, {}]>;
