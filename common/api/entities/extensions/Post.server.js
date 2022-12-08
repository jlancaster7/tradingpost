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
                if (req.body.postId) {
                    return { "ids": { "values": [req.body.postId] } };
                }
                else if (req.body.userId) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBMkM7QUFDM0MsMERBQXVEO0FBQ3ZELDJEQUFzRDtBQUV0RCwwREFBaUU7QUFFakUsdUNBQXlEO0FBQ3pELG9DQUFtRDtBQUNuRCxrREFBZ0U7QUFFaEUsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUc1RSxpQ0FBaUM7QUFHakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQzFCLE1BQU0sRUFBRSxXQUFXO0NBQ3BCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDckMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQztBQUVMLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBUyxFQUFFO0lBQUMsT0FBQSxJQUFJLENBQUMsS0FBSyxDQUN2QyxNQUFNLGNBQWMsQ0FBQyxDQUNuQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0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