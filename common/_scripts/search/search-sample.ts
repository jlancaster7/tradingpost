import 'dotenv/config';
import {Client as ElasticClient} from '@elastic/elasticsearch';
import { DefaultConfig } from "../../configuration";
import pgPromise from "pg-promise";
import yargs from "yargs";

(async () => {
    const indexName = "tradingpost-search";
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration['cloudId'] as string
        },
        auth: {
            apiKey: elasticConfiguration['apiKey'] as string
        },
        maxRetries: 5,
    });
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    
    const argv = yargs(process.argv.slice(2)).argv;
    // @ts-ignore
    //console.log(argv.test);
    const searchTerm = argv.test;
    /*
    let query = `SELECT symbol, company_name, market_cap, industry FROM security 
                  LEFT JOIN security_information
                  ON security.id = security_information.security_id
                  WHERE sector IN (SELECT sector FROM security WHERE symbol = $1 AND issue_type ='cs')
                  AND issue_type = 'cs'
                  AND security_information.market_cap 
                      BETWEEN ((SELECT market_cap FROM security_information 
                            LEFT JOIN security 
                            ON security.id = security_information.security_id 
                            WHERE symbol = $1) * .75)
                      AND ((SELECT market_cap FROM security_information 
                          LEFT JOIN security 
                          ON security.id = security_information.security_id 
                          WHERE symbol = $1) * 1.25)
                  AND symbol != $1
                  limit 5
                `;
    const repo = await pgClient.any(query, [searchTerm.slice(1)]);
    const similarTerm = repo.map(a => '$' + a.symbol).join(',');
    */
    
    // Get Users Following IDs
    const response = await elasticClient.search({
        index: indexName,
        size: 20, 
        from: 0,
        "query": {
          "function_score": {
            "query": {
              "function_score": {
                "query": {
                  "bool": {
                    "should": [
                      {
                        "match": {
                          "content.body": {
                            "analyzer": "synonym_analyzer", 
                            "query": searchTerm,
                            "boost": 1
                          }
                      }},
                      {
                        "match": {
                          "content.title": {
                            "analyzer": "synonym_analyzer", 
                            "query": searchTerm,
                            "boost": 1
                          }
                        }}/*,
                        {
                          "match": {
                            "content.body": {
                              "analyzer": "synonym_analyzer", 
                              "query": similarTerm,
                              "boost": 0.01
                            }
                          }},
                          {
                            "match": {
                              "content.title": {
                                "analyzer": "synonym_analyzer", 
                                "query": similarTerm,
                                "boost": 0.01
                              }
                            }}*/    
                    ],
                    "minimum_should_match": 1,
                    "boost": 1
                }
              },
                // @ts-ignore
                "gauss": {
                  "platformCreatedAt": {
                    "origin": "now-1h",
                    "scale": "7d"
                  }
                },
                "boost": 1
              }
            },
            "field_value_factor": {
              "field": "postTypeValue",
              "factor": 2,
              "modifier": "sqrt"
            }
          }
        }
    });
    const {hits} = response.hits;
    
    hits.forEach((a) => {
      // @ts-ignore
      //console.log([a._score, a._source.id, a._source.content.body, a._source.platformCreatedAt]);
    })
    
    pgp.end();
})()