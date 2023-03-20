import Repository from './repository';
import { StartSpeechSynthesisTaskCommand, 
    PollyClient, 
    GetSpeechSynthesisTaskCommand 
} from '@aws-sdk/client-polly'
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class AudioService {
    s3BucketAudio: string;
    pollyClient: PollyClient;
    pollyParams: PollyParams;
    defaultVoiceId: string;
    constructor(pollyClient: PollyClient, s3BucketName: string)  {
        this.pollyClient = pollyClient;
        this.s3BucketAudio = s3BucketName;
        this.defaultVoiceId = "Matthew";
        this.pollyParams = {
            OutputFormat: "mp3",
            OutputS3BucketName: this.s3BucketAudio,
            OutputS3KeyPrefix: '',
            Text: "",
            TextType: "ssml",
            Engine: 'neural',
            VoiceId: this.defaultVoiceId,
            SampleRate: "22050",
          };
    }
    getPollyAudioFileUrl = async(taskId: string) => {
        let status = await this.pollyClient.send(new GetSpeechSynthesisTaskCommand({TaskId: taskId}));
        
        while (status.SynthesisTask?.TaskStatus !== 'completed') {
            await sleep(3000);
            status = await this.pollyClient.send(new GetSpeechSynthesisTaskCommand({TaskId: taskId}));
            if (status.SynthesisTask?.TaskStatus === 'failed') {
                console.error(status.SynthesisTask);
                throw new PublicError('aws polly task failed');
            }
        }
        return status.SynthesisTask.OutputUri;
    }
    createAudioFile = async (id: string, unixTimeStamp: string, transcript: string, folderPath?: string, voiceId?: string) => {
        this.pollyParams.Text = `<speak><amazon:domain name="news">` + transcript + `</amazon:domain></speak>`;
        this.pollyParams.OutputS3KeyPrefix = folderPath ? `${folderPath}/${id}.${unixTimeStamp}` : `${id}.${unixTimeStamp}`;
        this.pollyParams.VoiceId = voiceId || this.defaultVoiceId;

        const result = await this.pollyClient.send(new StartSpeechSynthesisTaskCommand(this.pollyParams));
        
        if (!result.SynthesisTask?.TaskId) throw new Error('no task id was available');
        
        return await this.getPollyAudioFileUrl(result.SynthesisTask?.TaskId);
    }
}

export class PublicError extends Error {
    statusCode: number

    constructor(msg: Error["message"], code = 400) {
        super(msg);
        this.statusCode = code;
    }
}

export type PollyParams = {
    OutputFormat: string
    OutputS3BucketName: string
    OutputS3KeyPrefix: string
    Text: string
    TextType: string
    Engine: string
    VoiceId: string
    SampleRate: string
}