import {Client} from 'pg'

enum URL_FORMAT {
    STANDARD = "https://www.youtube.com/channel/",
    CUSTOM = "https://www.youtube.com/c/"
}

class YouTube {
    private db: Client;
    private apiKey: string;
    private baseUrl: string = "https://www.googleapis.com/youtube/v3"

    constructor(db: Client, apiKey: string) {
        this.db = db;
        this.apiKey = apiKey
    }

    import = async () => {

    }

    importVideos = async () => {

    }

    importUsers = async (channelUrls: string[]) => {
        for (const channelUrl of channelUrls) {
            if (channelUrl.includes(URL_FORMAT.STANDARD)) {
                const channelID = channelUrl.replace(URL_FORMAT.STANDARD, '');
                const channelParams = new URLSearchParams({
                    key: this.apiKey,
                    part: "snippet,statistics,status",
                    id: channelID,
                    maxResults: '10'
                });

                const url = `${this.baseUrl}/channels${channelParams.toString()}`
                const response = await fetch(url);

            }
        }
        const users = channelUrls.map((channelUrl: string) => {

        });
    }
}