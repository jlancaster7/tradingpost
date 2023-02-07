import 'dotenv/config';
import ElasticService from '@tradingpost/common/elastic';
import { SearchBody } from '@tradingpost/common/models/elastic/search'
import { DefaultConfig } from "@tradingpost/common/configuration";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import { OpenAIClass } from './openAI';
import Repository from './repository';
import { newsBotInitOutput } from './init';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { StartSpeechSynthesisTaskCommand, PollyClient } from '@aws-sdk/client-polly'
import ffmpegPath  from 'ffmpeg-static'
import cp from 'child_process';
import stream, { Writable } from 'stream';
import assert from 'assert';
import got from 'got'


export class NewsBotClass {
    openaiService: OpenAIClass;
    elastic: ElasticService;
    repo: Repository;

    openAiResponseModel: string;
    maxTokens: number;
    temperature: number;
    n: number;
    s3BucketVideo: string;
    s3BucketAudio: string;
    pollyClient: PollyClient;
    pollyParams: any;
    constructor(init: newsBotInitOutput)  {
        this.openaiService = init.openaiServices;
        this.elastic = init.elasticService;
        this.repo = init.repo;
        this.openAiResponseModel = 'text-davinci-003';
        this.maxTokens = 200;
        this.temperature= 0;
        this.n = 1
        this.s3BucketVideo = 'tradingpost-video-files'
        this.s3BucketAudio = 'tradingpost-audio-files'
        this.pollyClient = new PollyClient({ region: "us-east-1" })
        this.pollyParams = {
            OutputFormat: "mp3",
            OutputS3BucketName: this.s3BucketAudio,
            Text: "",
            TextType: "text",
            VoiceId: "Joanna",
            SampleRate: "22050",
          };
    }
    createNewsSummaryPost = async (articleText: string, articleUrl: string, source: string) => {
        const summary = await this.createSummary(articleText);

        //await this.addDBandElastic(summary, articleUrl, source);
    }
    getVideoFileUrl = async(fileName: string) => {
        return await this.repo.getVideoUrl(this.s3BucketVideo, fileName)
    }
    getAudioFileUrl = async(fileName: string) => {
        return await this.repo.getAudioFile(this.s3BucketAudio, fileName)
    }
    mergeAudioVideo = async (audioFileUri: string) => {
        const commandArray = []
        const videoFileUrl = await this.getVideoFileUrl('ApexLegends1');
        
        //const audioFileUrl = await this.getAudioFileUrl(audioFileUri.replace('s3://tradingpost-audio-files/', '').replace('.mp3', ''))
        const audioFileUrl = await this.getAudioFileUrl('7fcf6350-e4ee-4b41-8ef6-62ebff4ca9c5')
        const videoStream = got.stream.get(videoFileUrl)
        const audioStream = got.stream.get(audioFileUrl)
        
        const result = new stream.PassThrough({ highWaterMark:  1024 * 512 });
        if (!ffmpegPath) return result;
        let ffmpegProcess = cp.spawn(ffmpegPath, [
            // supress non-crucial messages
            '-loglevel', '8', '-hide_banner',
            // input audio and video by pipe
            '-i', 'pipe:3', '-i', 'pipe:4',
            // map audio and video correspondingly
            '-map', '0:a', '-map', '1:v',
            // no need to change the codec
            '-c', 'copy', 
            // output mp4 and pipe
            '-f', 'matroska', 'pipe:5'
        ], {
            // no popup window for Windows users
            windowsHide: true,
            stdio: [
                // silence stdin/out, forward stderr,
                'inherit', 'inherit', 'inherit',
                // and pipe audio, video, output
                'pipe', 'pipe', 'pipe'
            ]
        });


        audioStream.pipe(ffmpegProcess.stdio[3] as Writable );
        videoStream.pipe(ffmpegProcess.stdio[4] as Writable );
        
        ffmpegProcess.stdio[5].pipe(result);
        
        
        return result;
    }
    createAndUploadAV = async (audioFileUri: string) => {
         await this.repo.uploadVideoStream(this.s3BucketVideo,'testVideo',await this.mergeAudioVideo(''))
    }
    createAudioFile = async (articleText: string) => {
        
        this.pollyParams.Text = articleText;
        console.log(this.pollyParams)
        const result = await this.pollyClient.send(new StartSpeechSynthesisTaskCommand(this.pollyParams))
        return result.SynthesisTask?.OutputUri
    }

    createSummary = async (articleText: string) => {

        const prompt = `Summarize the following article in 100 words or less.\n Article:\n${articleText}\nSummary:\n`

        const response = await this.openaiService.getModelResponse(this.openAiResponseModel, {
            prompt: prompt,
            n: this.n,
            max_tokens: this.maxTokens
        })
        if (!response.choices[0].text) return '';
        return response.choices[0].text.replace('"', '').replace('"', '');
    }
    addDBandElastic = async (summary: string, articleUrl: string, source: string) => {
        const now = (new Date()).toISOString()
        const amendedSummary = `${summary}\n\n<a href="${articleUrl}">${source}</a>`
        const dbInsertResult = await this.repo.insertPost({
            user_id: '934dc296-fc3a-4234-a9da-bc3f65ac9a3e',
            title: '',
            body: amendedSummary,
            subscription_level: 'standard',
            max_width: 400,
            aspect_ratio: 10
        })
        if (!dbInsertResult) {
            console.error('news summary failed to insert into db')
            return
        }

        const searchItem: SearchBody = {
            id: `tradingpost_${dbInsertResult}`,
            content: {
                body: amendedSummary,
                description: null,
                htmlBody: null,
                htmlTitle: null,
                title: ''
            },
            imageUrl: null,
            meta: {},
            platform: {
                displayName: 'Michael',
                imageUrl: null,
                profileUrl: null,
                username: null
            },
            platformCreatedAt: now,
            platformUpdatedAt: now,
            postType: "tradingpost",
            subscription_level: 'standard',
            postTypeValue: 3,
            postUrl: articleUrl,
            ratingsCount: 0,
            tradingpostCreatedAt: now,
            tradingpostUpdatedAt: now,
            size: {
                maxWidth: 400,
                aspectRatio: 1,
            },
            user: {
                id: '934dc296-fc3a-4234-a9da-bc3f65ac9a3e',
                imageUrl: null,
                name: "Michael",
                type: "",
                username: 'Michael'
            }
        };
        await this.elastic.ingest([searchItem], 'tradingpost-search')
    }

}