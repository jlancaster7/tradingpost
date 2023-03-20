import { ChatCompletionRequestMessage } from "openai"

export interface HTTPConfiguration {
    method: string
    headers?: Record<string, string>
    body?: any
}

export type TableInfo = {
    id: number
    created_at: Date
    updated_at: Date
}

export type TranscriptListResponse = {
    symbol: string
    transcripts: {
            id: string
            quarter: number
            symbol: string
            time: string
            title: string
            year: number
        }[]   
}
export type TranscriptList = {
    symbol: string
    transcriptId: string
    quarter: number
    year: number
    time: string
    title: string
    audio: string | null
    participant: TranscriptResponse['participant'] | null
}

export type TranscriptListTable = TranscriptList & TableInfo;

export type TranscriptResponse = {
    audio: string
    id: string
    participant: {
        description: string
        name: string
        role: string
    }[]
    quarter: number
    symbol: string
    time: string
    title: string
    transcript: {
        name: string
        session: string
        speech: string
    }[]
    year: number
}

export type Transcript = {
    transcriptId: string
    participantDescription: string
    participantName: string
    participantRole: string
    session: string
    speech: string
    callOrdering: number
}


export type TranscriptTable = Transcript & TableInfo;

export type TranscriptWithDetail = {
    transcriptId: string
    quarter: number
    year: number
    symbol: string
    time: string
    title: string
    audio: string | null
    participantDescription: string
    participantName: string
    participantRole: string
    session: string
    speech: string
    callOrdering: number
}


export type TranscriptWithDetailTable = TranscriptWithDetail & TableInfo;


export type TranscriptTrainingSet = {
    transcriptId: string
    trainingSetId: number
    prompt: string
    promptPosition: string
    response: string
    responsePosition: string
    type: string
    quarter?: string
    year?: string
}

export type TranscriptTrainingSetTable = TranscriptTrainingSet & TableInfo;

export type FineTuneJobInput = {
    training_file: string
    validation_file?: string
    model?: string
    n_epochs?: number
    batch_size?: number
    learning_rate_multiplier?: number
    prompt_loss_weight?: number
    compute_classification_metrics?: boolean
    classification_n_classes?: number
    classification_positive_class?: string
    classification_betas?: any[]
    suffix?: string
}
export type ModelResponseInput = {
    model: string
    prompt?: string
    suffix?: string
    max_tokens?: number
    temperature?: number
    top_p?: number
    n?: number
    stream?: boolean
    logprobs?: number
    echo?: boolean
    stop?: string | string[]
    presence_penalty?: number
    frequency_penalty?: number
    best_of?: number
    logit_bias?: any
    user?: string
}

export type ChatResponseInput = {
    model: string
    messages: ChatCompletionRequestMessage[]
    max_tokens?: number
    temperature?: number
    top_p?: number
    n?: number
    stream?: boolean
    stop?: string | string[]
    presence_penalty?: number
    frequency_penalty?: number
    logit_bias?: any
    user?: string
}

export type TranscriptEmbedding = {
    transcriptId: string
    speech: string
    embedding: string
    transcriptTrainingId: number
    period: string
}
export type TranscriptEmbeddingTable = TranscriptEmbedding & TableInfo;

export type PromptResponse = {
    userId: string
    symbol: string
    prompt: string
    response: string
    contextLength: number
}
export type AccountInfo = {
    userId: string
    userName: string
    firstName: string
    lastName: string
    email: string
    verified?: boolean
    tokensUsed: number
    totalTokens: number
}
export type CreateUserInfo = {
    email: string,
    first_name: string,
    last_name: string,
    handle: string,
    dummy: boolean
}