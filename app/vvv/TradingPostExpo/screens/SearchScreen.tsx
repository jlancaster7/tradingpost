
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Header, Subheader } from "../components/Headers";
import { List } from "../components/List";
import { NoDataPanel } from "../components/NoDataPanel";
import { ProfileBar } from "../components/ProfileBar";
import { SearchBar } from "../components/SearchBar";
import { ElevatedSection } from "../components/Section";
import { useSecuritiesList } from "../SecurityList";
import { flex, fonts, sizes, row } from "../style";
import { FeedPart } from "./FeedScreen";
import { FlatList } from "react-native-gesture-handler";
import {PrimaryChip} from '../components/PrimaryChip'
import {isNotUndefinedOrNull} from "../utils/validators";
import { DashTabScreenProps } from "../navigation/pages";
import { CompanyProfileBar } from "../components/CompanyProfileBar";
import { AppColors } from "../constants/Colors";


export const SearchScreen = (props: DashTabScreenProps<'Search'>) => {
    const [tempSearchText, setTempSearchText] = useState(''),
        [searchText, setSearchText] = useState<string[]>([]),
        [watchlistId, setWatchlistId] = useState(''),
        [dateRange, setDateRange] = useState<{beginDateTime?: string, endDateTime?: string}>({}),
        [people, setPeople] = useState<Interface.IUserList[]>(),
        [searchSecurities, setSearchSecurities] = useState<Interface.ISecurityList[]>(),
        [isHoldings, setIsHoldings] = useState(false),
        scrollRef = useRef<FlatList>(null),
        { securities: { list: securities, byId } } = useSecuritiesList(),
        {width: windowWidth, scale} = useWindowDimensions();
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
    useEffect(() => {
        (async () => {
            if (watchlistId) {
                const watchlist = await Api.Watchlist.get(watchlistId);
                if (watchlist) setSearchText(watchlist.items.map(a => `$${a.symbol}`))
            }
        })()
    }, [watchlistId])
    useEffect(() => {
        (async () => {
            if (isHoldings) {
                const holdings = (await Api.User.extensions.getHoldings({}))
                if (holdings) setSearchText(holdings.filter((a) => byId[a.security_id] && byId[a.security_id].symbol !== 'USD:CUR').map(a => `$${byId[a.security_id].symbol}`))
            }
        })()
    }, [isHoldings])
    useEffect(() => {
        setDateRange({beginDateTime: props.route.params.beginDateTime, endDateTime: props.route.params.endDateTime})
        if (props.route.params.searchTerms) setSearchText(props.route.params.searchTerms)
        else if (props.route.params.isHoldings) setIsHoldings(props.route.params.isHoldings)
        else if (props.route.params.watchlistId) setWatchlistId(props.route.params.watchlistId)
    }, [props.route.params.beginDateTime, props.route.params.endDateTime, props.route.params.searchTerms, props.route.params.watchlistId, props.route.params.isHoldings])
    return (
        <View style={[flex, { backgroundColor: AppColors.background }]}>
            <View style={{width: '90%', alignSelf: 'center', marginVertical: sizes.rem1 }}>
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
                    <View style={[row, Object.keys(dateRange).length ? {display: 'flex'} : {display: 'none'}]}>
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
                    <View style={[row, searchText.length ? {display: 'flex'} : {display: 'none'}]}>
                        {
                            isNotUndefinedOrNull(searchText) && Array.isArray(searchText) && searchText.map((chip, i) => {
                                return (
                                    <PrimaryChip isAlt
                                                includeX={true}
                                                pressEvent={() => {
                                                    setSearchText(searchText.filter(a => a !== chip))
                                                    setTempSearchText('')
                                                }}
                                                key={i} 
                                                label={chip}
                                                style={{zIndex: 1,backgroundColor: 'rgba(53, 162, 101, 0.50)'}}/>
                                )
                            })                   
                        }    
                    </View>
                </ScrollView>
            </View>
            <FlatList
                data={[
                    <View key={`id_${(people?.length || 0) + (searchSecurities?.length || 0)}`} style={{ marginLeft: sizes.rem1}}>            
                        <View style={[people?.length ? {display: 'flex', marginBottom: sizes.rem0_5} : {display: 'none'}, ]}>
                            <List
                                listKey="people"
                                datasetKey={`people_id_${people?.length}`}
                                horizontal
                                data={people}
                                loadingMessage={" "}
                                noDataMessage={" "}
                                loadingItem={undefined}
                                renderItem={(item) => {
                                    return <ElevatedSection title="" style={{flex: 1}}>
                                        <ProfileBar user={item.item} style={{marginBottom:-sizes.rem0_5}} />
                                    </ElevatedSection>
                                }}
                            />
                        </View>
                        <View style={[searchSecurities?.length ? {display: 'flex', marginBottom: sizes.rem0_5} : {display: 'none'}]}>
                            <List
                                key={`objKey_${searchSecurities?.length}`}
                                listKey={`companies_${searchSecurities?.length}`}
                                datasetKey={`company_id_${searchSecurities?.length}`}
                                horizontal
                                data={searchSecurities}
                                loadingMessage={" "}
                                noDataMessage={" "}
                                loadingItem={undefined}
                                renderItem={(item) => {
                                    return (
                                        
                                            <CompanyProfileBar symbol={item.item.symbol}
                                                            companyName={item.item.company_name} 
                                                            imageUri={item.item.logo_url}
                                                            secId={item.item.id}
                                                            makeShadedSec
                                                            />
                                        
                                    )
                                }}
                            />
                        </View>
                    </View>,
                    <View>
                        {(searchText.length) ? <FeedPart dateRange={dateRange} searchTerms={searchText} /> : <NoDataPanel message={'Search for Analysts, Posts, or Companies!'} />}
                    </View>
                ]}
                renderItem={(info) => {
                    return info.item
                }}
                ref={scrollRef}
                contentContainerStyle={[{ paddingTop: 0 }]} 
                nestedScrollEnabled
                >
            </FlatList>
        </View>
    );
}
