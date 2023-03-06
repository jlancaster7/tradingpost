import { NavigationProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    Alert,
    Animated,
    FlatListProps,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    ScrollView,
    useWindowDimensions
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import { PlusContentButton } from "../components/PlusContentButton";
import {
    ContentStyle,
    PostList,
    PostListOnScroll,
    PostScrollAnimEnd,
    PostScrollBegin,
    PostScrollDragBegin,
    PostScrollEnd
} from "../components/PostList";
import { spaceOnSide, postInnerHeight, postExtraVerticalSpace } from "../components/PostView";
import { DashTabScreenProps } from "../navigation/pages";
import { Logo, LogoNoBg, SearchInactive, social } from "../images";
import { IconifyIcon } from "../components/IconfiyIcon";
import { ElevatedSection } from "../components/Section";
import { flex, row, sizes } from "../style";
import { social as socialStyle } from '../style'
import { SvgExpo } from "../components/SvgExpo";
import { diff } from "react-native-reanimated";
import { navIcons, WatchlistIcon } from "../images";
import { IconButton } from "../components/IconButton";
import { SearchBar } from "../components/SearchBar";
import { isNotUndefinedOrNull } from "../utils/validators";
import { PrimaryChip } from "../components/PrimaryChip";
import { Icon } from "@ui-kitten/components";
import { AppColors } from "../constants/Colors";
import { NoDataPanel } from "../components/NoDataPanel";
import { useSecuritiesList } from "../SecurityList";
import { Header } from "../components/Headers";
import { List } from "../components/List";
import { ProfileBar } from "../components/ProfileBar";
import { CompanyProfileBar } from "../components/CompanyProfileBar";
const platformsAll = ["TradingPost", "Twitter", "Substack", "Spotify", "YouTube"];

const platformsMarginH = 0.02;
const platformsMarginTop = sizes.rem4-4;

const useClampAmount = () => {
    const { width } = useWindowDimensions();
    return useMemo(() => (width - width * platformsMarginH * platformsAll.length * 2) / platformsAll.length + platformsMarginTop, [width]);
}

export const FeedScreen = (props: DashTabScreenProps<'Feed'>) => {
    const [platforms, setPlatforms] = useState<string[]>([]),
        [platformClicked, setPlatformClicked] = useState(''),
        [tempSearchText, setTempSearchText] = useState(''),
        [searchText, setSearchText] = useState<string[]>([]),
        [dateRange, setDateRange] = useState<{beginDateTime?: string, endDateTime?: string}>({}),
        [people, setPeople] = useState<Interface.IUserList[]>(),
        [searchSecurities, setSearchSecurities] = useState<Interface.ISecurityList[]>(),
        { securities: { list: securities, byId, bySymbol } } = useSecuritiesList(),
        [filterType, setFilterType] = useState<'none' | 'portfolio' | 'watchlist' | 'search'>('none'),
        [selectedWatchlist, setSelectedWatchlist] = useState<{id?: number, name?: string}>({}),
        [usersWatchlists, setUsersWatchlist] = useState<{id: number, name: string}[]>([]),
        [userPortfolio, setUserPortfolio] = useState<string[]>([])
    
    const nav = useNavigation();
    let clampAmount = useClampAmount();

    const translateHeaderY = useRef(new Animated.Value(0)).current;
    const lastOffsetY = useRef(new Animated.Value(0)).current;
    const translateMultipler = useRef(new Animated.Value(1)).current;
    useFocusEffect(useCallback(()=> {
        (async () => {
            try {
                //watchilst data
                const watchlists = await Api.Watchlist.extensions.getAllWatchlists()
                setUsersWatchlist([
                    {id: watchlists.quick.id, name: 'Quick List'},
                    ...watchlists.created.map(a => {
                        return {id: a.id, name: a.name}
                    })])
                //portfolio data
                const portfolio = (await Api.User.extensions.getHoldings({})).filter(a => byId[a.security_id] !== undefined && byId[a.security_id].symbol !== 'USD:CUR')
                
                setUserPortfolio(portfolio.map(a => `$${byId[a.security_id].symbol}`))
                
            
            } catch (ex) {
                console.error(ex);
            }
        })()
    },[]))
    useEffect(() => {
        const watchlistId = props.route.params.watchlistId 
        setDateRange({beginDateTime: props.route.params.beginDateTime, endDateTime: props.route.params.endDateTime})
        if (props.route.params.searchTerms) setSearchText(props.route.params.searchTerms)
        else if (props.route.params.isHoldings) setFilterType('portfolio')
        else if (watchlistId) {
            (async () => {
                const watchlist = await Api.Watchlist.get(watchlistId);
                setSearchText(watchlist.items.map(a => `$${a.symbol}`))
            })()
        }
    }, [props.route.params.beginDateTime, props.route.params.endDateTime, props.route.params.searchTerms, props.route.params.watchlistId, props.route.params.isHoldings])
    useEffect(() => {
        if (searchText.length === 1 && searchText[0].length > 3) {
            (async () => {
                try {
                    setPeople(await Api.User.extensions.search({
                        term: searchText[0]
                    }));
                }
                catch (ex) {
                    console.error(ex);
                }
                try {
                    const output: Interface.ISecurityList[] = []
                    searchText.forEach((el, i) => {
                        const modSearch = el.slice(0,1) === '$' ? el.slice(1) : el;
                        const regex = new RegExp(`^${modSearch}`, "i");
                        securities.forEach((item) => {
                            if ((regex.test(item.company_name) || regex.test(item.symbol ))) output.push(item)
                        })
                    })
                    setSearchSecurities(output)
                } catch (ex) {
                    console.error(ex)
                }
            })()
        }
        else if (searchText.length > 0) {
            try {
                setPeople(undefined);
                const output: Interface.ISecurityList[] = []
                searchText.forEach((el, i) => {
                    const modSearch = el.slice(0,1) === '$' ? el.slice(1) : el;
                    const regex = new RegExp(`^${modSearch}`, "i");
                    securities.forEach((item) => {
                        if ((item.symbol === modSearch.toUpperCase())) output.push(item)
                    })
                })
                setSearchSecurities(output)
            } catch (ex) {
                console.error(ex)
            }
        }
        else {
            setPeople(undefined);
            setSearchSecurities(undefined)
        }
    }, [searchText])
    //const [clampRange, setClampRange] = useState<[number, number]>([0, clampAmount])
    
    const diffValue = Animated.subtract(translateHeaderY, lastOffsetY);

    //if content is negative  
    const tester = Animated.diffClamp(translateHeaderY, 0, clampAmount)

    const currentClamp = tester.interpolate({
        inputRange: [0, clampAmount],
        outputRange: [0, -clampAmount],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        translateHeaderY.addListener((v: { value: number }) => {
            if (v.value < clampAmount)
                translateMultipler.setValue(0)
            else
                translateMultipler.setValue(1)
        })
        return () => translateHeaderY.removeAllListeners();
    }, [translateHeaderY, translateMultipler])

    useEffect(() => {
        setPlatforms((prior) => {
            if (prior.includes(platformClicked)) return prior.filter(a => a !== platformClicked)
            else if (platformClicked.length) {
                prior.push(platformClicked);
                return prior;
            } else return prior;
        })
        setPlatformClicked('')
    }, [platformClicked])
    useEffect(() => {
        (async () => {
            if (filterType === 'portfolio') {
                setSearchText(userPortfolio)
            }
            else if (filterType === 'watchlist') {
                if (selectedWatchlist.id) {
                    const watchlist = await Api.Watchlist.get(selectedWatchlist.id);
                    setSearchText(watchlist.items.map(a => `$${a.symbol}`))
                } else {
                    setSearchText([])
                }
            }
            else if (filterType === 'none') {
                setSearchText([])
                if (Object.keys(selectedWatchlist).length) setSelectedWatchlist({})
            }
        })()
    }, [filterType, selectedWatchlist])

    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <Animated.View
                style={{
                    flex: 1,
                    // transform: [{ translateY: margin }]
                    // marginTop: margin
                }}>
                {filterType === 'search' && searchText.length === 0 ? 
                        <NoDataPanel message={'Search for Analysts, Posts, or Companies!'} /> 
                        : <FeedPart
                            platforms={platforms}
                            dateRange={dateRange} 
                            searchTerms={searchText} 
                            onScrollAnimationEnd={() => {
                                //translateHeaderY.setValue(-2000);ns
                                console.log("Scroll Anim Has Ended")
                            }}
                            onRefresh={() => {
                                //translateHeaderY.setValue(-1000);
                            }}
                            contentContainerStyle={{
                                paddingTop: clampAmount + sizes.rem1
                            }}
                            onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                                {
                                    nativeEvent:
                                    {
                                        //velocity: { y: translateHeaderY }
                                        contentOffset: { y: translateHeaderY }
                                    }
                                }
                            ], { useNativeDriver: true })}
                            onScrollBeginDrag={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                                {
                                    nativeEvent:
                                    {
                                        contentOffset: { y: lastOffsetY }
                                    }

                                }
                            ], { useNativeDriver: true })}
                        />}
            </Animated.View>
            <PlusContentButton onPress={() => {
                nav.navigate("PostEditor")
            }} />
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    transform: [{ translateY: Animated.multiply(currentClamp, translateMultipler) }],
                    alignItems: "stretch",
                    width: "100%",
                    backgroundColor: "white",
                    //borderBottomColor: "#ccc",
                    //borderBottomWidth: 1
                }}
                key={`selector_${platforms.length}`}>
                {/*<PlatformSelector platforms={platforms} setPlatformClicked={setPlatformClicked} />*/}
                <View style={{flex: 1, marginHorizontal: sizes.rem1 }}>
                        <View style={{flexDirection: 'row'}}>
                            
                            <View style={{flex: 1}}>  
                                <SearchBar 
                                        text={tempSearchText}
                                        placeholder="Search... ($AAPL, Tim, Tesla, etc.)"
                                        onTextChange={(v) => {
                                            setTempSearchText(v);
                                        }}
                                        onEditingSubmit={(e) => {
                                            setSearchText([...searchText, e])
                                            setTempSearchText('')
                                        }}
                                    />
                                <ScrollView style={{marginTop: sizes.rem0_5, marginBottom: sizes.rem0_5}}
                                            nestedScrollEnabled 
                                            horizontal
                                            showsHorizontalScrollIndicator={false}>
                                    <View style={[row, Object.keys(dateRange).length ? {display: 'flex', alignItems: 'center'} : {display: 'none'}]}>
                                        {
                                            dateRange.beginDateTime &&
                                                    <PrimaryChip isAlt
                                                                includeX={true}
                                                                pressEvent={() => {
                                                                    setDateRange({})
                                                                }}
                                                                key={'dateRangeChip'} 
                                                                label={`Last ${Math.round((((new Date()).valueOf() - (new Date(dateRange.beginDateTime)).valueOf()) / 3600000))} Hours`}
                                                                style={{zIndex: 1,backgroundColor: 'rgba(53, 162, 101, 0.50)'}}/>
                                        }    
                                    </View>
                                    <View style={[row, searchText.length ? {display: 'flex', marginVertical: sizes.rem0_5} : {display: 'none'}]}>
                                        {
                                            isNotUndefinedOrNull(searchText) && Array.isArray(searchText) && searchText.map((chip, i) => {
                                                /*if (chip.startsWith('$') && bySymbol[chip.slice(1)]) return (    
                                                    <CompanyProfileBar symbol={bySymbol[chip.slice(1)].symbol}
                                                            companyName={bySymbol[chip.slice(1)].company_name} 
                                                            imageUri={bySymbol[chip.slice(1)].logo_url}
                                                            secId={bySymbol[chip.slice(1)].id}
                                                            makeShadedSec
                                                            />
                                                )
                                                else*/ return (
                                                    
                                                    <PrimaryChip isAlt
                                                                includeX={true}
                                                                pressEvent={() => {
                                                                    setSearchText(searchText.filter(a => a !== chip))
                                                                    setTempSearchText('')
                                                                }}
                                                                key={`search_term_${i}`} 
                                                                label={chip}
                                                                style={{zIndex: 1,backgroundColor: 'rgba(53, 162, 101, 0.50)'}}/>
                                                )
                                            })                   
                                        }    
                                    </View>
                                </ScrollView>
                            </View>  
                        </View>
                        
                    </View>
                {filterType === 'none' ? 
                    <View style={{flex: 1, marginHorizontal: sizes.rem2 / 2,  flexDirection: 'row', justifyContent: 'center' }}>
                        <Pressable style={{flex: 1}} onPress={() => {
                            setFilterType('portfolio')
                        }}>
                            <ElevatedSection style={{flex: 1, flexDirection: 'row', justifyContent: 'center', height: 40}} title="">
                                <IconButton iconSource={ navIcons.Portfolio.inactive}/>
                                <Text style={{alignSelf: 'center'}}>
                                    Portfolio
                                </Text>
                            </ElevatedSection>
                        </Pressable>
                        <Pressable style={{flex: 1}} onPress={() => {
                            setFilterType('watchlist')
                        }}>
                            <ElevatedSection style={{flex: 1, flexDirection: 'row', justifyContent: 'center', height: 40}} title="">
                                <WatchlistIcon height={24} width={38} style={{height: 24, width: 38 }} />
                                <Text style={{alignSelf: 'center'}}>
                                    Watchlists
                                </Text>
                            </ElevatedSection>
                        </Pressable>
                    </View> : 
                filterType === 'portfolio' ? 
                    <View style={{marginRight: sizes.rem2 / 2,  flexDirection: 'row', justifyContent: 'center' }}>
                        <Pressable style={{flex: 1, flexDirection: 'row', marginLeft: sizes.rem0_25}}
                            onPress={() => {
                                setFilterType('none')
                            }}>
                            <Icon 
                                fill={"#708090"}
                                height={30}
                                width={38}
                                name="arrow-ios-back-outline" style={{
                                    marginTop: 6,
                                    height: 30,
                                    width: 38
                                }}/>
                            <ElevatedSection style={{flex: 1, flexDirection: 'row', justifyContent: 'center', height: 40,borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'}} title="">
                                <IconButton iconSource={ navIcons.Portfolio.active}/>
                                <Text style={{alignSelf: 'center', color: '#FA6334'}}>
                                    Portfolio
                                </Text>
                            </ElevatedSection>
                        </Pressable>
                    </View> : 
                filterType === 'watchlist' ? 
                    <View style={{marginRight: sizes.rem2 / 2,  flexDirection: 'row'}}>
                        <Pressable style={{marginLeft: sizes.rem0_25}}
                                    onPress={() => {
                                        setFilterType('none')
                            }}>
                            <Icon 
                                fill={"#708090"}
                                height={30}
                                width={38}
                                name="arrow-ios-back-outline" style={{
                                    marginTop: 6,
                                    height: 30,
                                    width: 30
                                }}/>
                        </Pressable>
                            <ScrollView style={{}}
                                        nestedScrollEnabled 
                                        horizontal
                                        showsHorizontalScrollIndicator={false}>
                                <Pressable 
                                    onPress={() => {
                                        nav.navigate("WatchlistEditor", {})
                                        }}>
                                    <ElevatedSection style={{height: 40,flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} title="">
                                        <Icon 
                                            fill={AppColors.secondary}
                                            height={24}
                                            width={24}
                                            name="plus-square" style={{
                                                //marginTop: 7,
                                                height: 24,
                                                width: 24
                                            }}/>
                                            <Text style={{ marginLeft: 10}}>
                                                Create
                                            </Text>
                                    </ElevatedSection>
                                </Pressable>
                                {usersWatchlists.map((a, i) => {
                                    return (
                                        <Pressable key={`watchlists_${i}`} onPress={() => {
                                            if (selectedWatchlist.id === a.id) setSelectedWatchlist({})
                                            else setSelectedWatchlist(a)
                                        }}>
                                            <ElevatedSection style={[{height: 40, justifyContent: 'center'}, selectedWatchlist.id === a.id ? {borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(53, 162, 101, 1)', backgroundColor: '#F0F0F0'} : {}]} title="">
                                                <Text style={selectedWatchlist.id === a.id ? {color:'#FA6334'} : {}}>
                                                    {a.name}
                                                </Text>
                                            </ElevatedSection>
                                        </Pressable>
                                        )
                                        })}
                            </ScrollView>
                    </View> :
                filterType === 'search' ?
                    <View>
                        
                    </View> : undefined}
            </Animated.View>
        </View>
    );
}

export const PlatformSelector = (props: { platforms: string[], setPlatformClicked: React.Dispatch<React.SetStateAction<string>> }) => {

    return (
        <View style={{ 
            //marginHorizontal: sizes.rem2 / 2, 
            flexDirection: 'row', 
            justifyContent: 'center' }}>
            {platformsAll.map((item) => {
                const logo = social[item + "Logo" as keyof typeof social];
                return (
                    <ElevatedSection title=""
                        key={`socialV_${item}`}
                        style={[{
                            flex: .5,
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            //marginTop: platformsMarginTop,
                            marginHorizontal: "3%"
                        }, props.platforms.includes(item) ? {
                            borderStyle: 'solid',
                            borderWidth: 2,
                            borderColor: 'rgba(53, 162, 101, 1)',
                            backgroundColor: '#F0F0F0'
                        } : {}
                        ]}>
                        <Pressable style={{ flex: 1 }} onPress={() => {
                            props.setPlatformClicked(item)
                        }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                                {item !== 'TradingPost' ?
                                    <IconifyIcon key={`social_${item}`}
                                        icon={logo}
                                        svgProps={{}}
                                        style={{
                                            aspectRatio: 1,
                                            backgroundColor: 'transparent',
                                            justifyContent: 'center'
                                        }}
                                        currentColor={item === 'Substack' ? socialStyle.substackColor : undefined} />
                                    : <SvgExpo style={{ height: "100%", aspectRatio: 1 }}>
                                        <Logo />
                                    </SvgExpo>
                                }
                            </View>
                        </Pressable>
                    </ElevatedSection>
                )
            })}
        </View>
    )
}



export const FeedPart = (props: {
    bookmarkedOnly?: boolean,
    searchTerms?: string | string[],
    dateRange?: { beginDateTime?: string, endDateTime?: string }
    userId?: string,
    platforms?: string[]
    onScroll?: PostListOnScroll
    onMomentumScrollEnd?: PostScrollEnd
    onMomentumScrollBegin?: PostScrollBegin
    onScrollBeginDrag?: PostScrollDragBegin
    onScrollAnimationEnd?: PostScrollAnimEnd
    contentContainerStyle?: ContentStyle
    onRefresh?: () => void
}) => {
    const clampAmount = useClampAmount();
    const { width: windowWidth } = useWindowDimensions();
    let { bookmarkedOnly, searchTerms, userId, platforms, dateRange } = props
    const [postsKey, setPostsKey] = useState(Date.now());
    return <PostList
        contentContainerStyle={props.contentContainerStyle}
        onScroll={props.onScroll}
        onScrollBeginDrag={props.onScrollBeginDrag}
        onMomentumScrollBegin={props.onMomentumScrollBegin}
        onMomentumScrollEnd={props.onMomentumScrollEnd}
        onScrollAnimationEnd={props.onScrollAnimationEnd}
        onRefresh={() => {
            setPostsKey(Date.now())
            if (props.onRefresh) {
                props.onRefresh();
            }
        }

        }
        onReloadNeeded={() => {
            setPostsKey(Date.now());
        }}

        key={bookmarkedOnly ? String(Date.now()) : postsKey}
        datasetKey={(searchTerms ? searchTerms instanceof Array ? searchTerms.join('') : searchTerms : "____________") + platforms?.join()}
        posts={async (allItems, page, sizeCache) => {
            console.log("PAGE: ", page)
            let reqData: any = {};
            if (searchTerms) {
                searchTerms = searchTerms instanceof Array ? searchTerms : [searchTerms];
                reqData.terms = (() => {
                    let result: string[] = []
                    searchTerms.forEach((el: string) => {
                        if (el[0] === '$') result.push(el.toLowerCase())
                        else result.push(el)
                    })
                    return result
                })()
            }
            if (platforms?.length) reqData.platforms = (() => platforms)()
            if (dateRange) {
                reqData.beginDateTime = dateRange.beginDateTime;
                reqData.endDateTime = dateRange.endDateTime;
            }
            const posts = (await Api.Post.extensions.feed({
                page,
                bookmarkedOnly: bookmarkedOnly,
                userId,
                data: Object.keys(reqData).length ? reqData : undefined
            }));

            const newItems = [...(allItems || []), ...posts]
            newItems.forEach((itm, index) => {
                if (!sizeCache[index]) {
                    sizeCache[index] = {
                        index,
                        offset: index ? (sizeCache[index - 1].offset + sizeCache[index - 1].length) : 0,
                        length: postInnerHeight(itm, Math.min(windowWidth, 680) - spaceOnSide) + postExtraVerticalSpace(itm)
                    }
                }
            })
            return newItems;
        }}
    />
}