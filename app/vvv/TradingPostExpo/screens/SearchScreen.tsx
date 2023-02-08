import {NavigationProp} from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import { Avatar, Text } from "@ui-kitten/components";
import { SecPressable } from './WatchlistViewerScreen'
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { ButtonGroup } from "../components/ButtonGroup";
import { Header, Subheader } from "../components/Headers";
import { List } from "../components/List";
import { NoDataPanel } from "../components/NoDataPanel";
import { ProfileBar } from "../components/ProfileBar";
import { SearchBar } from "../components/SearchBar";
import { ElevatedSection } from "../components/Section";
import { useSecuritiesList } from "../SecurityList";
import { flex, fonts, sizes } from "../style";
import { FeedPart } from "./FeedScreen";
import { FlatList } from "react-native-gesture-handler";


export const SearchScreen = (props: { navigation: NavigationProp<any> } & { route: { params: {} } }) => {
    const [searchText, setSearchText] = useState(""),
        [searchType, setSearchType] = useState<"posts" | "people">("posts"),
        [people, setPeople] = useState<Interface.IUserList[]>(),
        [searchSecurities, setSearchSecurities] = useState<Interface.ISecurityList[]>(),
        debounceRef = useRef<any>(),
        { securities: { list: securities } } = useSecuritiesList();
    useEffect(() => {
        clearTimeout(debounceRef.current);
            if (searchText.length >= 3) {
                debounceRef.current = setTimeout(async () => {
                    try {
                        setPeople(await Api.User.extensions.search({
                            term: searchText
                        }));
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                    try {
                        const output: Interface.ISecurityList[] = []
                        
                        const modSearch = searchText.slice(0,1) === '$' ? searchText.slice(1) : searchText;
                        const regex = new RegExp(`^${modSearch}`, "i");
                        securities.forEach((item) => {
                            if ((regex.test(item.company_name) || regex.test(item.symbol ))) {
                                output.push(item)
                            }
                                
                        })
                        setSearchSecurities(output)
                    } catch (ex) {
                        console.error(ex)
                    }
                }, 500)
            }
            else if (searchText.length > 0) {
                try {
                    setPeople(undefined);
                    const output: Interface.ISecurityList[] = []
                    const modSearch = searchText.slice(0,1) === '$' ? searchText.slice(1) : searchText;
                    const regex = new RegExp(`^${modSearch}`, "i");
                    securities.forEach((item) => {
                        if ((regex.test(item.symbol ))) {
                            output.push(item)
                        }
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
        
    }, [searchText, searchType])

    return (
        <View style={[flex, { backgroundColor: "#F7f8f8" }]}>
            <View style={{width: '90%', alignSelf: 'center', marginBottom: sizes.rem0_5}}>
                <SearchBar 
                    placeholder="Search... ($AAPL, Tim, Tesla, etc.)"
                    onTextChange={(v) => {
                        setSearchText(v);
                    }} 
                />
            </View>
            <FlatList
                data={[
                    <View key={`id_${(people?.length || 0) + (searchSecurities?.length || 0)}`} style={{ marginLeft: sizes.rem1}}>            
                    <View style={[people?.length ? {display: 'flex'} : {display: 'none'}, ]}>
                        <Header text="Analysts" />
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
                    <View style={[searchSecurities?.length ? {display: 'flex'} : {display: 'none'}]}>
                        <Header text="Companies"/>
                        <List
                            listKey="companies"
                            datasetKey={`company_id_${searchSecurities?.length}`}
                            horizontal
                            data={searchSecurities}
                            loadingMessage={" "}
                            noDataMessage={" "}
                            loadingItem={undefined}
                            //numColumns={2}
                            renderItem={(item) => {
                                const regex = new RegExp('placeholder.png', "i");
                                if (regex.test(item.item.logo_url)) {
                                    return (
                                        <ElevatedSection title="" style={{flexShrink: 1, marginBottom: 6, paddingHorizontal: 2, paddingVertical: 2, justifyContent: 'center'}}>
                                            <Text style={{textAlign: 'center', fontSize: 12}}>
                                                {item.item.company_name}
                                            </Text>
                                        </ElevatedSection>
                                    )
                                }
                                else {
                                    return (
                                    <ElevatedSection title="" style={{flex: 1, marginBottom: 6, paddingHorizontal: sizes.rem0_5, paddingVertical: sizes.rem0_5}}>
                                        <SecPressable securityId={item.item.id}>                            
                                                <Avatar
                                                    style={{ borderRadius: 5 }}
                                                    shape={'square'}
                                                    resizeMode={'cover'}
                                                    source={ {uri: item.item.logo_url} }
                                                    size="giant"
                                                />
                                        </SecPressable>
                                </ElevatedSection>)
                                }
                            }}
                        />
                    </View>
                    <View style={[searchText !== "" ? {display: 'flex'} : {display: 'none'}]}>
                        <Header text="Posts" />
                    </View>
                    </View>,
                    <View>
                        {(searchText !== "") ? <FeedPart searchTerms={searchText} /> : <NoDataPanel message={'Search for Analysts, Posts, or Companies!'} />}
                    </View>
                
                ]}
                renderItem={(info) => {
                    return info.item
                }}
                contentContainerStyle={[{ paddingTop: 10 }]} 
                nestedScrollEnabled
                >
            </FlatList>
        </View>
    );
}
