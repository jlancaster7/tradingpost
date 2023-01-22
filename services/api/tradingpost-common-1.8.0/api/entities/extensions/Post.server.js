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
            INSERT INTO flagged_content_log (post_id, user_reporter_id, reason, status, details)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBMkM7QUFDM0MsMERBQXVEO0FBQ3ZELDJEQUFzRDtBQUV0RCwwREFBaUU7QUFFakUsdUNBQXlEO0FBQ3pELG9DQUFtRDtBQUNuRCxrREFBZ0U7QUFFaEUsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUU1RSxpQ0FBaUM7QUFFakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQzFCLE1BQU0sRUFBRSxXQUFXO0NBQ3BCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDckMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQztBQUVMLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBRXZDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFDcEMsT0FBQSxNQUFNLGNBQWMsQ0FBQyxDQUNuQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztRQUNyQyxN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