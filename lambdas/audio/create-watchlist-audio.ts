import 'dotenv/config'
import { Context } from "aws-lambda";
import { DefaultConfig } from '@tradingpost/common/configuration';
import pgPromise, {IDatabase, IMain} from 'pg-promise';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import { PollyClient } from '@aws-sdk/client-polly';
import { OpenAIClass } from '@tradingpost/common/openAI'
import Repository from './repository';
import { AudioService } from './AVservice';


let pgClient: IDatabase<any>;
let pgp: IMain;
const runLambda = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM('postgres');
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
    }

    const pollyClient = new PollyClient({ region: "us-east-1" })
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM('elastic');
    
    const openaiConfiguration = await DefaultConfig.fromCacheOrSSM('openai');
    const openaiService = new OpenAIClass(openaiConfiguration.OPENAI_API_KEY);
    const elasticClient = new ElasticClient({
        cloud: {
          id: elasticConfiguration.cloudId as string
        },
        auth: {
          apiKey: elasticConfiguration.apiKey as string
        },
        maxRetries: 5,
      })

    const repo = new Repository(pgClient, pgp, elasticClient);
    const av = new AudioService(pollyClient, 'tradingpost-audio-files');

    const newsSources = [
        "DeItaone",
        "AlphaSenseInc",
        "stocktalkweekly",
        "TheTranscript_",
        //"unusual_whales",
        "Briefingcom",
        "WallStJesus",
        "WatcherGuru",
        //"TrendSpider"
      ]
    const dateNow = new Date();
    let dateLowerBound: Date
    if (dateNow.getHours() > 10) {
      dateLowerBound = new Date((new Date(dateNow.setHours(4))).setMinutes(0))
    } else {
      dateLowerBound = new Date((new Date(new Date(dateNow.setDate(dateNow.getDate() - 1)).setHours(4))).setMinutes(0))
    }
    
    const watchlists = await repo.getAllTpWatchlists();

    for (let w of watchlists) {
      
      const tickers = w.symbols.map(a => `$${a.toUpperCase()}`)
      console.log(tickers.join(', '))
      const sourceData = await repo.getTweetsByTicker(tickers, 0, newsSources, dateLowerBound, 15)
      if (sourceData.length <= 3) {
        console.log('skipping')
        continue;
      }
      const newsText = sourceData.map(a => '* ' + a.text + '\n' + (new Date(a.date || '')).toLocaleString()).join('\n') 
      
      const trimmedNews = `Below is a list of tweets, starting with an * and ending with the date and time in which it was posted, covering current financial market news. Could you please conslidate tweets that are about similar topics, remove any tweets that make ambiguous references, remove any that refer to links or pictures and make sure to note the time if the tweet refers to a stock price or the change in a stock price? \nTweets: ${newsText}`

      const trimmedResponse = await openaiService.getChatResponse('gpt-3.5-turbo', [{ role: 'user', content: trimmedNews }], {
        n: 1,
        max_tokens: 1000,
        temperature: 0
      })

      if (!trimmedResponse.choices[0].message?.content) continue;
      console.log(trimmedResponse.choices[0].message?.content)
      const scriptPrompt = `Create a script for a newscaster to read to an audiance using the list of news items below without an intro or outro.\nNews items: ${trimmedResponse.choices[0].message?.content}`

      const scriptResponse = await openaiService.getChatResponse('gpt-3.5-turbo', [{ role: 'user', content: scriptPrompt }], {
        n: 1,
        max_tokens: 1000,
        temperature: 0
      })
      
      if (!scriptResponse.choices[0].message?.content) continue;
      
      console.log(scriptResponse.choices[0].message.content)
      const audioUrl = await av.createAudioFile(
        `${w.id}`, 
        `${dateLowerBound.valueOf()}`, 
        scriptResponse.choices[0].message.content,
        'watchlists')
      if (!audioUrl) continue
      await repo.insertAudio([{
        relatedType: 'watchlist', 
        relatedId: `${w.id}`, 
        audioUrl: audioUrl, 
        transcript: scriptResponse.choices[0].message.content, 
        userId: w.user_id
      }])
      console.log(audioUrl)
      
    }
}
export const run = async (event: any, context: Context) => {
  await runLambda();
}
runLambda();