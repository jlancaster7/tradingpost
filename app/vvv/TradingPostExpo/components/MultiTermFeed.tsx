import { NavigationProp } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { View, Text } from "react-native";
import { SizeParts } from './List'
import { PlusContentButton } from "../components/PlusContentButton";
import { PostList } from "../components/PostList";
import { spaceOnSide, postInnerHeight, PostView } from "../components/PostView";
import { DashTabScreenProps } from "../navigation/pages";

export const MultiTermFeedPart = (props: { searchText?: string[] }) => {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { searchText } = props
    return <PostList
        key={"STATIC"}
        datasetKey={"____________"}

        posts={async (allItems, page, sizeCache) => {
            console.log(page)
            const posts = (await Api.Post.extensions.multitermfeed({
                page,
                data: searchText ? {
                    terms: searchText
                } : undefined
            }));

            const newItems = [...(allItems || []), ...posts]
            newItems.forEach((itm, index) => {
                if (!sizeCache[index]) {
                    sizeCache[index] = {
                        index,
                        offset: index ? sizeCache[index - 1].offset + sizeCache[index - 1].length : 0,
                        length: postInnerHeight(itm, Math.min(windowWidth, 680) - spaceOnSide)
                    }
                }
            })
            return newItems;
        }}
    />
}
/*
export const CreateMultiTermQuery = (searchTerms: string | string[]) => {
    if (typeof searchTerms === 'string' ) searchTerms = [searchTerms];
    let multiMatchQueryPart= [];
    for (let d of searchTerms) {
        const queryPart = {
            "multi_match": {
                "fields": ["content.body", "content.title"],
                "query": `${d}`,
                "analyzer": "synonym_analyzer",
                "boost": 1
            }
        }
        multiMatchQueryPart.push(queryPart)
    }
    let query ={"bool": {
        "should": [
        {
            "function_score": {
                "query": { 
                "bool": {
                    "must": [
                        {
                        "bool": {
                            "should": `${multiMatchQueryPart}`,
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "youtube"
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
                            "should": `${multiMatchQueryPart}`,
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "tweet"
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
                            "should": `${multiMatchQueryPart}`,
                                "minimum_should_match": 1,
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
                            "should": `${multiMatchQueryPart}`,
                                "minimum_should_match": 1,
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
        }
        ],
        "minimum_should_match": 1,
        "boost": 1
    }
    }
    return query;
    
} 
*/