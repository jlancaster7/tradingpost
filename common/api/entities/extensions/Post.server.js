"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUserTest = exports.newSearchTest = exports.newFeedTest = exports.CreateMultiTermQuery = void 0;
const _1 = require(".");
const configuration_1 = require("../../../configuration");
const EntityApiBase_1 = require("../static/EntityApiBase");
const elasticsearch_1 = require("@elastic/elasticsearch");
const cache_1 = require("../../cache");
const db_1 = require("../../../db");
const client_s3_1 = require("@aws-sdk/client-s3");
const elastic_1 = __importDefault(require("../../../elastic"));
const service_1 = __importDefault(require("../../../social-media/tradingposts/service"));
const luxon_1 = require("luxon");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});
const s3Bucket = 'tradingpost-app-data';
const userQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/userFeedv3.json",
    }))).Body);
}))();
const searchQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/searchv3.json",
    }))).Body);
}))();
const feedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feedv6.json",
    }))).Body);
}))();
const multipartFeedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/multipartFeedv1.json",
    }))).Body);
}))();
let postsPerPage = 10;
const bookmarkQuery = (bookmarkItems) => {
    return {
        bool: {
            must: [
                {
                    terms: {
                        _id: bookmarkItems
                    }
                },
                {
                    exists: {
                        "field": "size"
                    }
                }
            ]
        }
    };
};
const userQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield userQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to userQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const searchQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield searchQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const feedQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield feedQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const multipartFeedQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield multipartFeedQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
exports.default = (0, _1.ensureServerExtensions)({
    feed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        const userCache = (yield (0, cache_1.getUserCache)());
        const curUserData = userCache[req.extra.userId];
        const postData = (yield (0, cache_1.getPostCache)());
        const pool = yield db_1.getHivePool;
        const results = yield pool.query(`SELECT dsp.user_id AS "analyst_user_id"
                                                                       FROM data_subscriber dsr
                                                                                LEFT JOIN data_subscription dsp
                                                                                          ON dsp.id = dsr.subscription_id
                                                                       WHERE dsr.user_id = $1`, [req.extra.userId]);
        const subscriptions = results.rows.map(a => a.analyst_user_id);
        subscriptions.push(req.extra.userId);
        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        const bookmarkItems = [];
        if (req.body.bookmarkedOnly) {
            bookmarkItems.push(...Object.keys(curUserData.bookmarks));
            postsPerPage = bookmarkItems.length;
        }
        else {
            postsPerPage = 10;
        }
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration['cloudId']
            },
            auth: {
                apiKey: elasticConfiguration['apiKey']
            },
            maxRetries: 5,
        });
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.postId) {
                    return { "ids": { "values": [req.body.postId] } };
                }
                else if (req.body.userId) {
                    //return searchQuery({user_id: req.body.userId})
                    return userQuery({ user_id: req.body.userId, subscriptions: subscriptions });
                }
                else if (req.body.bookmarkedOnly) {
                    const query = bookmarkQuery(bookmarkItems);
                    return query;
                }
                else if (req.body.data)
                    return searchQuery({ terms: req.body.data.terms, subscriptions: subscriptions, blocks: curUserData.blocked });
                else
                    return feedQuery({ subscriptions: subscriptions, blocks: curUserData.blocked });
                //return newFeedTest(subscriptions, curUserData.blocked);
            }))()
        });
        //TODO::: Need to limit terms on this
        const { hits } = response.hits;
        hits.forEach((h) => {
            var _a, _b, _c;
            h.ext = {
                user: (_b = userCache[((_a = h._source) === null || _a === void 0 ? void 0 : _a.user.id) || ""]) === null || _b === void 0 ? void 0 : _b.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id],
                upvoteCount: ((_c = postData[h._id]) === null || _c === void 0 ? void 0 : _c.upvotes) || 0
            };
        });
        //probably could trim down the responses in the future
        return hits;
    }),
    setBookmarked: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO:  need to to add incorp into api build in the future
        const pool = yield db_1.getHivePool;
        if (rep.body.is_bookmarked)
            yield pool.query(`INSERT INTO data_bookmark(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE
                              FROM data_bookmark
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId]);
        return rep.body;
    }),
    getUpvotes: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const result = yield pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    }),
    setUpvoted: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO:  need to to add incorp into api build in the future
        const pool = yield db_1.getHivePool;
        if (rep.body.is_upvoted)
            yield pool.query(`INSERT INTO data_upvote(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE
                              FROM data_upvote
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId]);
        const result = yield pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    }),
    create: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const result = yield pool.query(`INSERT INTO data_post(user_id, title, body, subscription_level, max_width, aspect_ratio)
                                         VALUES ($1, $2, $3, $4, $5, $6)
                                         RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height]);
        const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration.cloudId
            },
            auth: {
                apiKey: elasticConfiguration.apiKey
            },
            maxRetries: 5,
        });
        const indexName = "tradingpost-search";
        const user = (yield (0, db_1.execProc)('public.api_user_get', {
            data: { id: req.extra.userId }
        }))[0];
        const elasticService = new elastic_1.default(elasticClient, indexName);
        const usersAndTradingPosts = {
            id: result.rows[0].id,
            user_id: req.extra.userId,
            subscription_level: req.body.subscription_level,
            title: req.body.title,
            body: req.body.content,
            tradingpost_user_handle: user.handle,
            tradingpost_user_email: user.email,
            tradingpost_user_profile_url: user.profile_url || '',
            aspect_ratio: req.body.height,
            max_width: req.body.width,
            created_at: luxon_1.DateTime.fromJSDate(result.rows[0].created_at),
            updated_at: luxon_1.DateTime.fromJSDate(result.rows[0].updated_at)
        };
        yield elasticService.ingest(service_1.default.map([usersAndTradingPosts]));
        return {};
    }),
    multitermfeed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        const userCache = (yield (0, cache_1.getUserCache)());
        const curUserData = userCache[req.extra.userId];
        const pool = yield db_1.getHivePool;
        const results = yield pool.query(`SELECT dsp.user_id AS "analyst_user_id"
                                                                       FROM data_subscriber dsr
                                                                                LEFT JOIN data_subscription dsp
                                                                                          ON dsp.id = dsr.subscription_id
                                                                       WHERE dsr.user_id = $1`, [req.extra.userId]);
        const subscriptions = results.rows.map(a => a.analyst_user_id);
        subscriptions.push(req.extra.userId);
        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        postsPerPage = 10;
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration['cloudId']
            },
            auth: {
                apiKey: elasticConfiguration['apiKey']
            },
            maxRetries: 5,
        });
        if (req.body.data) {
            const query = yield (0, exports.CreateMultiTermQuery)(req.body.data, subscriptions, curUserData.blocked);
            console.log(query.bool.should);
        }
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.data) {
                    return (0, exports.CreateMultiTermQuery)(req.body.data, subscriptions, curUserData.blocked);
                }
                else {
                    return feedQuery({ subscriptions, blocks: curUserData.blocked });
                }
            }))()
        });
        //TODO::: Need to limit terms on this
        const { hits } = response.hits;
        hits.forEach((h) => {
            var _a, _b;
            h.ext = {
                user: (_b = userCache[((_a = h._source) === null || _a === void 0 ? void 0 : _a.user.id) || ""]) === null || _b === void 0 ? void 0 : _b.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id]
            };
        });
        //probably could trim down the responses in the future
        return hits;
    }),
    report: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        yield pool.query(`
            INSERT INTO flagged_content_log (post_id, user_reporter_id, reason, status)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED"]);
        return {};
    })
});
const CreateMultiTermQuery = (searchTerms, subscriptions, blocks) => {
    let multiMatchQueryPart = [];
    const key = Object.keys(searchTerms)[0];
    for (let d of Object.values(searchTerms[key])) {
        const queryPart = {
            "multi_match": {
                "fields": ["content.body", "content.title"],
                "query": `${d}`,
                "analyzer": "synonym_analyzer",
                "boost": 1
            }
        };
        multiMatchQueryPart.push(queryPart);
    }
    // @ts-ignore
    return multipartFeedQuery({ multiMatchQueryPart, subscriptions, blocks });
    /*
    let query = `{"bool": {
      "should": [
      {
          "function_score": {
              "query": {
                "bool": {
                  "should": [
                    {"bool": {
                      "must": [
                          {
                          "bool": {
                              "should": [${multiMatchQueryPart}],
                                  "minimum_should_match": 1,
                                  "boost": 1
                              }
                          },
                          {
                              "match": {
                              "postType": "tradingpost"
                              }
                          }
                        ]}},
                          {
                            "terms": {
                              "subscription_level": [
                            
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id":
                                        ${JSON.stringify(subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          },
                          {
                            "bool": {
                              "must_not": [
                                {
                                  "terms": {
                                    "user.id": ${JSON.stringify(blocks)}
                                    
                                  }
                                  
                                }
                              ]
                            }
                          }
                  ],
                  "minimum_should_match": 3,
                  "boost": 1
                }
              
              },
              "functions": [
                  {
                  "exp": {
                      "platformCreatedAt": {
                      "origin": "now",
                      "scale": "7d"
                      }
                  },
                  "weight": 1.2
                  }
              ],
              "boost_mode": "replace"
          }
      },
      {
        "function_score": {
            "query": {
              "bool": {
                "should": [
                  {"bool": {
                    "must": [
                        {
                        "bool": {
                            "should": [${multiMatchQueryPart}],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                        },
                        {
                            "match": {
                            "postType": "youtube"
                            }
                        }
                      ]}},
                        {
                          "terms": {
                            "subscription_level": [
                          
                              "standard"
                              ]
                          }
                        },
                        {
                          "bool": {
                            "must": [
                            {
                              "terms": {
                                "user.id":
                                      ${JSON.stringify(subscriptions)}
                                  
                              }
                            },
                            {
                              "match": {
                                "subscription_level": "premium"
                              }
                            }
                            ]
                          }
                        },
                        {
                          "bool": {
                            "must_not": [
                              {
                                "terms": {
                                  "user.id": ${JSON.stringify(blocks)}
                                  
                                }
                                
                              }
                            ]
                          }
                        }
                ],
                "minimum_should_match": 3,
                "boost": 1
              }
            
            },
            "functions": [
                {
                "exp": {
                    "platformCreatedAt": {
                    "origin": "now",
                    "scale": "7d"
                    }
                },
                "weight": 1.2
                }
            ],
            "boost_mode": "replace"
        }
    },
    {
      "function_score": {
          "query": {
            "bool": {
              "should": [
                {"bool": {
                  "must": [
                      {
                      "bool": {
                          "should": [${multiMatchQueryPart}],
                              "minimum_should_match": 1,
                              "boost": 1
                          }
                      },
                      {
                          "match": {
                          "postType": "tweet"
                          }
                      }
                    ]}},
                      {
                        "terms": {
                          "subscription_level": [
                        
                            "standard"
                            ]
                        }
                      },
                      {
                        "bool": {
                          "must": [
                          {
                            "terms": {
                              "user.id":
                                    ${JSON.stringify(subscriptions)}
                                
                            }
                          },
                          {
                            "match": {
                              "subscription_level": "premium"
                            }
                          }
                          ]
                        }
                      },
                      {
                        "bool": {
                          "must_not": [
                            {
                              "terms": {
                                "user.id": ${JSON.stringify(blocks)}
                                
                              }
                              
                            }
                          ]
                        }
                      }
              ],
              "minimum_should_match": 3,
              "boost": 1
            }
          
          },
          "functions": [
              {
              "exp": {
                  "platformCreatedAt": {
                  "origin": "now",
                  "scale": "7d"
                  }
              },
              "weight": 1.2
              }
          ],
          "boost_mode": "replace"
      }
  },
  {
    "function_score": {
        "query": {
          "bool": {
            "should": [
              {"bool": {
                "must": [
                    {
                    "bool": {
                        "should": [${multiMatchQueryPart}],
                            "minimum_should_match": 1,
                            "boost": 1
                        }
                    },
                    {
                        "match": {
                        "postType": "substack"
                        }
                    }
                  ]}},
                    {
                      "terms": {
                        "subscription_level": [
                      
                          "standard"
                          ]
                      }
                    },
                    {
                      "bool": {
                        "must": [
                        {
                          "terms": {
                            "user.id":
                                  ${JSON.stringify(subscriptions)}
                              
                          }
                        },
                        {
                          "match": {
                            "subscription_level": "premium"
                          }
                        }
                        ]
                      }
                    },
                    {
                      "bool": {
                        "must_not": [
                          {
                            "terms": {
                              "user.id": ${JSON.stringify(blocks)}
                              
                            }
                            
                          }
                        ]
                      }
                    }
            ],
            "minimum_should_match": 3,
            "boost": 1
          }
        
        },
        "functions": [
            {
            "exp": {
                "platformCreatedAt": {
                "origin": "now",
                "scale": "7d"
                }
            },
            "weight": 1.2
            }
        ],
        "boost_mode": "replace"
    }
  },
  {
  "function_score": {
      "query": {
        "bool": {
          "should": [
            {"bool": {
              "must": [
                  {
                  "bool": {
                      "should": [${multiMatchQueryPart}],
                          "minimum_should_match": 1,
                          "boost": 1
                      }
                  },
                  {
                      "match": {
                      "postType": "spotify"
                      }
                  }
                ]}},
                  {
                    "terms": {
                      "subscription_level": [
                    
                        "standard"
                        ]
                    }
                  },
                  {
                    "bool": {
                      "must": [
                      {
                        "terms": {
                          "user.id":
                                ${JSON.stringify(subscriptions)}
                            
                        }
                      },
                      {
                        "match": {
                          "subscription_level": "premium"
                        }
                      }
                      ]
                    }
                  },
                  {
                    "bool": {
                      "must_not": [
                        {
                          "terms": {
                            "user.id": ${JSON.stringify(blocks)}
                            
                          }
                          
                        }
                      ]
                    }
                  }
          ],
          "minimum_should_match": 3,
          "boost": 1
        }
      
      },
      "functions": [
          {
          "exp": {
              "platformCreatedAt": {
              "origin": "now",
              "scale": "7d"
              }
          },
          "weight": 1.2
          }
      ],
      "boost_mode": "replace"
  }
  }
      ],
      "minimum_should_match": 1,
      "boost": 1
  }
  }
`

    console.log(query);
    return JSON.parse(query);
*/
};
exports.CreateMultiTermQuery = CreateMultiTermQuery;
const newFeedTest = (subscriptions, blocks) => {
    const query = `{
        "function_score": {
            "query": {
                "bool": {
                    "should": [
                    {
                        "function_score": {
                            "query": { 
                            "bool": {
                                "should": [
                                  {
                                    "match": {
                                      "postType": "youtube"
                                      }
                                  },
                                  {
                                    "terms": {
                                      "subscription_level": [
                                   
                                        "standard"
                                        ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must": [
                                      {
                                        "terms": {
                                          "user.id": 
                                                ${JSON.stringify(subscriptions)}
                                            
                                        }
                                      },
                                      {
                                        "match": {
                                          "subscription_level": "premium"
                                        }
                                      }
                                      ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must_not": [
                                        {
                                          "terms": {
                                            "user.id": ${JSON.stringify(blocks)}
                                            
                                          }
                                          
                                        }
                                      ]
                                    }
                                  }
                                  
                                ],
                                "minimum_should_match": 3,
                                "boost": 1
                              }},
                            "functions": [
                                {
                                "exp": {
                                    "platformCreatedAt": {
                                    "origin": "now",
                                    "scale": "7d"
                                    }
                                },
                                "weight": 1.2
                                }
                            ],
                            "boost_mode": "replace"
                        }
                    },
                    {
                        "function_score": {
                            "query": { "bool": {
                                "should": [
                                  {
                                    "match": {
                                      "postType": "tweet"
                                      }
                                  },
                                  {
                                    "terms": {
                                      "subscription_level": [
                                    
                                        "standard"
                                        ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must": [
                                      {
                                        "terms": {
                                          "user.id": 
                                                ${JSON.stringify(subscriptions)}
                                            
                                        }
                                      },
                                      {
                                        "match": {
                                          "subscription_level": "premium"
                                        }
                                      }
                                      ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must_not": [
                                        {
                                          "terms": {
                                            "user.id": ${JSON.stringify(blocks)}
                                            
                                          }
                                          
                                        }
                                      ]
                                    }
                                  }
                                  
                                ],
                                "minimum_should_match": 3,
                                "boost": 1
                              }},
                            "functions": [
                                {
                                "exp": {
                                    "platformCreatedAt": {
                                    "origin": "now",
                                    "scale": "12h"
                                    }
                                },
                                "weight": 1
                                }
                            ],
                            "boost_mode": "replace"
                        }
                    },
                    {
                        "function_score": {
                            "query": { 
                              "bool": {
                                "should": [
                                  {
                                    "match": {
                                      "postType": "spotify"
                                      }
                                  },
                                  {
                                    "terms": {
                                      "subscription_level": [
                                     
                                        "standard"
                                        ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must": [
                                      {
                                        "terms": {
                                          "user.id": 
                                            ${JSON.stringify(subscriptions)}
                                            
                                        }
                                      },
                                      {
                                        "match": {
                                          "subscription_level": "premium"
                                        }
                                      }
                                      ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must_not": [
                                        {
                                          "terms": {
                                            "user.id": ${JSON.stringify(blocks)}
                                            
                                          }
                                          
                                        }
                                      ]
                                    }
                                  }
                                  
                                ],
                                "minimum_should_match": 3,
                                "boost": 1
                              }
                            },
                            "functions": [
                                {
                                "exp": {
                                    "platformCreatedAt": {
                                    "origin": "now",
                                    "scale": "7d"
                                    }
                                },
                                "weight": 1.2
                                }
                            ],
                            "boost_mode": "replace"
                        }
                    },
                    {
                        "function_score": {
                            "query": {
                            "bool": {
                                "should": [
                                  {
                                    "match": {
                                      "postType": "substack"
                                      }
                                  },
                                  {
                                    "terms": {
                                      "subscription_level": [
                                   
                                        "standard"
                                        ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(subscriptions)}
                                            
                                        }
                                      },
                                      {
                                        "match": {
                                          "subscription_level": "premium"
                                        }
                                      }
                                      ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must_not": [
                                        {
                                          "terms": {
                                            "user.id": ${JSON.stringify(blocks)}
                                            
                                          }
                                          
                                        }
                                      ]
                                    }
                                  }
                                  
                                ],
                                "minimum_should_match": 3,
                                "boost": 1
                              }}
                            ,
                            "functions": [
                                {
                                "exp": {
                                    "platformCreatedAt": {
                                    "origin": "now",
                                    "scale": "7d"
                                    }
                                },
                                "weight": 1.2
                                }
                            ],
                            "boost_mode": "replace"
                        }
                    },
                    {
                        "function_score": {
                            "query": { 
                            "bool": {
                                "should": [
                                  {
                                    "match": {
                                      "postType": "tradingpost"
                                      }
                                  },
                                  {
                                    "terms": {
                                      "subscription_level": [
                                
                                        "standard"
                                        ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must": [
                                      {
                                        "terms": {
                                          "user.id": 
                                              ${JSON.stringify(subscriptions)}
                                            
                                        }
                                      },
                                      {
                                        "match": {
                                          "subscription_level": "premium"
                                        }
                                      }
                                      ]
                                    }
                                  },
                                  {
                                    "bool": {
                                      "must_not": [
                                        {
                                          "terms": {
                                            "user.id": ${JSON.stringify(blocks)}
                                            
                                          }
                                          
                                        }
                                      ]
                                    }
                                  }
                                  
                                ],
                                "minimum_should_match": 3,
                                "boost": 1
                              }},
                            "functions": [
                                {
                                "exp": {
                                    "platformCreatedAt": {
                                    "origin": "now",
                                    "scale": "7d"
                                    }
                                },
                                "weight": 1.5
                                }
                            ],
                            "boost_mode": "replace"
                        }
                    }
                    ],
                    "minimum_should_match": 1,
                    "boost": 1
            }
        },
        "functions": [
              {
              "random_score": {
                  "seed": 2,
                  "field": "_seq_no"
              }
            }
        ],
        "boost": 1,
        "boost_mode": "avg"
        }
    }`;
    return JSON.parse(query);
};
exports.newFeedTest = newFeedTest;
const newSearchTest = (props) => {
    const query = `{
        "bool": {
            "should": [
            {
                "function_score": {
                    "query": { 
                      "bool": {
                          "must": [
                            {
                              "bool": {
                                "should": [
                                {
                                  "match": {
                                    "content.body": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                  }
                                },
                                {
                                    "match": {
                                      "content.title": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                }},
                                {
                                  "terms": {
                                    "subscription_level": [
                              
                                      "standard"
                                      ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must": [
                                    {
                                      "terms": {
                                        "user.id": 
                                            ${JSON.stringify(props.subscriptions)}
                                          
                                      }
                                    },
                                    {
                                      "match": {
                                        "subscription_level": "premium"
                                      }
                                    }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must_not": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(props.blocks)}
                                          
                                        }
                                        
                                      }
                                    ]
                                  }
                                }
                                    ],
                                    "minimum_should_match": 3,
                                    "boost": 1
                                  }
                                }
                            ,
                            {
                                "match": {
                                  "postType": "tweet"
                              }}
                            ]
                      }
                    },
                    "functions": [
                        {
                        "exp": {
                            "platformCreatedAt": {
                            "origin": "now",
                            "scale": "7d"
                            }
                        },
                        "weight": 1.2
                        }
                    ],
                    "boost_mode": "replace"
                }
            },
            {
                "function_score": {
                    "query": { 
                    "bool": {
                          "must": [
                            {
                              "bool": {
                                "should": [
                                {
                                  "match": {
                                    "content.body": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                }},
                                {
                                    "match": {
                                      "content.title": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                }},
                                {
                                  "terms": {
                                    "subscription_level": [
                              
                                      "standard"
                                      ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must": [
                                    {
                                      "terms": {
                                        "user.id": 
                                            ${JSON.stringify(props.subscriptions)}
                                          
                                      }
                                    },
                                    {
                                      "match": {
                                        "subscription_level": "premium"
                                      }
                                    }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must_not": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(props.blocks)}
                                          
                                        }
                                        
                                      }
                                    ]
                                  }
                                }
                                    ],
                                    "minimum_should_match": 3,
                                    "boost": 1
                                  }
                                }
                            ,
                            {
                                "match": {
                                  "postType": "youtube"
                              }}
                            ]
                      }},
                    "functions": [
                        {
                        "exp": {
                            "platformCreatedAt": {
                            "origin": "now",
                            "scale": "12h"
                            }
                        },
                        "weight": 1
                        }
                    ],
                    "boost_mode": "replace"
                }
            },
            {
                "function_score": {
                    "query": { 
                    "bool": {
                          "must": [
                            {
                              "bool": {
                                "should": [
                                {
                                  "match": {
                                    "content.body": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                }},
                                {
                                    "match": {
                                      "content.title": {
                                      "analyzer": "synonym_analyzer", 
                                      "query": ${JSON.stringify(props.terms)},
                                      "boost": 1
                                    }
                                }},
                                {
                                  "terms": {
                                    "subscription_level": [
                              
                                      "standard"
                                      ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must": [
                                    {
                                      "terms": {
                                        "user.id": 
                                            ${JSON.stringify(props.subscriptions)}
                                          
                                      }
                                    },
                                    {
                                      "match": {
                                        "subscription_level": "premium"
                                      }
                                    }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must_not": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(props.blocks)}
                                          
                                        }
                                        
                                      }
                                    ]
                                  }
                                }
                                    ],
                                    "minimum_should_match": 3,
                                    "boost": 1
                                  }
                                }
                            ,
                            {
                                "match": {
                                  "postType": "substack"
                              }}
                            ]
                      }},
                    "functions": [
                        {
                        "exp": {
                            "platformCreatedAt": {
                            "origin": "now",
                            "scale": "7d"
                            }
                        },
                        "weight": 1.2
                        }
                    ],
                    "boost_mode": "replace"
                }
            },
            {
                "function_score": {
                    "query": { 
                    "bool": {
                          "must": [
                            {
                              "bool": {
                                "should": [
                                {
                                  "match": {
                                    "content.body": ${JSON.stringify(props.terms)}
                                }},
                                {
                                    "match": {
                                      "content.title": ${JSON.stringify(props.terms)}
                                }},
                                {
                                  "terms": {
                                    "subscription_level": [
                              
                                      "standard"
                                      ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must": [
                                    {
                                      "terms": {
                                        "user.id": 
                                            ${JSON.stringify(props.subscriptions)}
                                          
                                      }
                                    },
                                    {
                                      "match": {
                                        "subscription_level": "premium"
                                      }
                                    }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must_not": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(props.blocks)}
                                          
                                        }
                                        
                                      }
                                    ]
                                  }
                                }
                                    ],
                                    "minimum_should_match": 3,
                                    "boost": 1
                                  }
                                }
                            ,
                            {
                                "match": {
                                  "postType": "spotify"
                              }}
                            ]
                      }},
                    "functions": [
                        {
                        "exp": {
                            "platformCreatedAt": {
                            "origin": "now",
                            "scale": "7d"
                            }
                        },
                        "weight": 1.2
                        }
                    ],
                    "boost_mode": "replace"
                }
            },
            {
                "function_score": {
                    "query": { 
                    "bool": {
                          "must": [
                            {
                              "bool": {
                                "should": [
                                {
                                  "match": {
                                    "content.body": ${JSON.stringify(props.terms)}
                                }},
                                {
                                    "match": {
                                      "content.title": ${JSON.stringify(props.terms)}
                                }},
                                {
                                  "terms": {
                                    "subscription_level": [
                              
                                      "standard"
                                      ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must": [
                                    {
                                      "terms": {
                                        "user.id": 
                                            ${JSON.stringify(props.subscriptions)}
                                          
                                      }
                                    },
                                    {
                                      "match": {
                                        "subscription_level": "premium"
                                      }
                                    }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "must_not": [
                                      {
                                        "terms": {
                                          "user.id": ${JSON.stringify(props.blocks)}
                                          
                                        }
                                        
                                      }
                                    ]
                                  }
                                }
                                    ],
                                    "minimum_should_match": 3,
                                    "boost": 1
                                  }
                                }
                            ,
                            {
                                "match": {
                                  "postType": "tradingpost"
                              }}
                            ]
                      }},
                    "functions": [
                        {
                        "exp": {
                            "platformCreatedAt": {
                            "origin": "now",
                            "scale": "7d"
                            }
                        },
                        "weight": 1.2
                        }
                    ],
                    "boost_mode": "replace"
                }
            }
            ],
            "minimum_should_match": 1,
            "boost": 1
    }
    }`;
    return JSON.parse(query);
};
exports.newSearchTest = newSearchTest;
const newUserTest = (props) => {
    const query = `{
    "bool": {
        "should": [
        {
            "function_score": {
                "query": { 
                  "bool": {
                      "should": [
                        {"bool": {
                          "must": [
                        {
                          "match": {
                            "postType": "youtube"
                        }},
                        {"match": {
                          "user.id": ${JSON.stringify(props.user_id)}
                        }}
                        ]
                        }},
                          {
                            "terms": {
                              "subscription_level": [
                        
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id": 
                                  ${JSON.stringify(props.subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          }
                              ],
                              "minimum_should_match": 2,
                              "boost": 1  
                      
                  }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                  "bool": {
                      "should": [
                        {"bool": {
                          "must": [
                        {
                          "match": {
                            "postType": "tweet"
                        }},
                        {"match": {
                          "user.id": ${JSON.stringify(props.user_id)}
                        }}
                        ]
                        }},
                          {
                            "terms": {
                              "subscription_level": [
                        
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id": 
                                  ${JSON.stringify(props.subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          }
                              ],
                              "minimum_should_match": 2,
                              "boost": 1  
                      
                  }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "12h"
                        }
                    },
                    "weight": 1
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                  "bool": {
                      "should": [
                        {"bool": {
                          "must": [
                        {
                          "match": {
                            "postType": "spotify"
                        }},
                        {"match": {
                          "user.id": ${JSON.stringify(props.user_id)}
                        }}
                        ]
                        }},
                          {
                            "terms": {
                              "subscription_level": [
                        
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id": 
                                  ${JSON.stringify(props.subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          }
                              ],
                              "minimum_should_match": 2,
                              "boost": 1  
                      
                  }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                  "bool": {
                      "should": [
                        {"bool": {
                          "must": [
                        {
                          "match": {
                            "postType": "substack"
                        }},
                        {"match": {
                          "user.id": ${JSON.stringify(props.user_id)}
                        }}
                        ]
                        }},
                          {
                            "terms": {
                              "subscription_level": [
                        
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id": 
                                  ${JSON.stringify(props.subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          }
                              ],
                              "minimum_should_match": 2,
                              "boost": 1  
                      
                  }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                  "bool": {
                      "should": [
                        {"bool": {
                          "must": [
                        {
                          "match": {
                            "postType": "tradingpost"
                        }},
                        {"match": {
                          "user.id": ${JSON.stringify(props.user_id)}
                        }}
                        ]
                        }},
                          {
                            "terms": {
                              "subscription_level": [
                        
                                "standard"
                                ]
                            }
                          },
                          {
                            "bool": {
                              "must": [
                              {
                                "terms": {
                                  "user.id": 
                                      ${JSON.stringify(props.subscriptions)}
                                    
                                }
                              },
                              {
                                "match": {
                                  "subscription_level": "premium"
                                }
                              }
                              ]
                            }
                          }
                              ],
                              "minimum_should_match": 2,
                              "boost": 1  
                      
                  }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        }
        ],
        "minimum_should_match": 1,
        "boost": 1
}
}`;
    return JSON.parse(query);
};
exports.newUserTest = newUserTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFDekMsMERBQXFEO0FBQ3JELDJEQUFvRDtBQUVwRCwwREFBK0Q7QUFFL0QsdUNBQXVEO0FBQ3ZELG9DQUFpRDtBQUNqRCxrREFBOEQ7QUFFOUQsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUU1RSxpQ0FBK0I7QUFFL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQztBQUVQLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBRXZDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFDbEMsT0FBQSxNQUFNLGNBQWMsQ0FBQyxDQUNqQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztRQUNuQyxN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