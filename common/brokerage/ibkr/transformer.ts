export interface TransformerRepository {

}

export default class IbkrTransformer {
    private _repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        this._repository = repository;
    }


}