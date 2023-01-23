//import Repository from "./repository";
import SecApi from "./secAPI";

export default class FinnhubService {
    //repo: Repository;
    finnhub: SecApi;
    constructor(
        //repo: Repository, 
        finnhub: SecApi) {
        //this.repo = repo;
        this.finnhub = finnhub;
    }
    
}