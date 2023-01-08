import { init, initOutput, availableTickers } from "./init"

(async () => {

    const Init = await init();
    for (let t of availableTickers) {

        const trainingSet = await Init.finnhubService.repo.getTrainingSet([t]);
        console.log(`${t} - Length of training set: ${trainingSet.length}`)

        //const embeddings = await Init.finnhubService.repo.getS3TranscriptEmbeddings(t);
        //console.log(`${t} - Length of embedding set: ${embeddings.length}`)
    }

})()