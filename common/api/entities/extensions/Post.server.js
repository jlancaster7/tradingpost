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
const feedQuery = (() => __awaiter(void 0, void 0, void 0, function* () {
    return JSON.parse(yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feed.json",
    }))).Body));
}))();
const userQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/userFeed.json",
    }))).Body);
}))();
const searchQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/search.json",
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
                if (req.body.userId) {
                    //return searchQuery({user_id: req.body.userId})  
                    return (0, exports.newUserTest)({ user_id: req.body.userId, subscriptions: subscriptions });
                }
                else if (req.body.bookmarkedOnly) {
                    const query = bookmarkQuery(bookmarkItems);
                    console.log(JSON.stringify(query));
                    return query;
                }
                else if (req.body.data)
                    return (0, exports.newSearchTest)({ terms: String(req.body.data.terms), subscriptions: subscriptions });
                else
                    return (0, exports.newFeedTest)(subscriptions);
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
        if (req.body.data)
            console.log((0, exports.CreateMultiTermQuery)(req.body.data, subscriptions));
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.data) {
                    return (0, exports.CreateMultiTermQuery)(req.body.data, subscriptions);
                }
                else {
                    return (0, exports.newFeedTest)(subscriptions);
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
    })
});
const CreateMultiTermQuery = (searchTerms, subscriptions) => {
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
        multiMatchQueryPart.push(JSON.stringify(queryPart));
    }
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
  }
`;
    console.log(query);
    return JSON.parse(query);
};
exports.CreateMultiTermQuery = CreateMultiTermQuery;
const newFeedTest = (subscriptions) => {
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
                                  }
                                  
                                ],
                                "minimum_should_match": 2,
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
                                  }
                                  
                                ],
                                "minimum_should_match": 2,
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
                                  }
                                  
                                ],
                                "minimum_should_match": 2,
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
                                  }
                                  
                                ],
                                "minimum_should_match": 2,
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
                                }
                                    ],
                                    "minimum_should_match": 2,
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
                                }
                                    ],
                                    "minimum_should_match": 2,
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
                                }
                                    ],
                                    "minimum_should_match": 2,
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
                                }
                                    ],
                                    "minimum_should_match": 2,
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
                                }
                                    ],
                                    "minimum_should_match": 2,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFDekMsMERBQXFEO0FBQ3JELDJEQUFvRDtBQUVwRCwwREFBK0Q7QUFFL0QsdUNBQXVEO0FBQ3ZELG9DQUFpRDtBQUNqRCxrREFBOEQ7QUFFOUQsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUc1RSxpQ0FBK0I7QUFHL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQztBQUVQLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBUyxFQUFFO0lBQUMsT0FBQSxJQUFJLENBQUMsS0FBSyxDQUNyQyxNQUFNLGNBQWMsQ0FBQyxDQUNqQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0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