import {NavigationProp} from "@react-navigation/native";
import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { ButtonGroup } from "../components/ButtonGroup";
import { List } from "../components/List";
import { ProfileBar } from "../components/ProfileBar";
import { SearchBar } from "../components/SearchBar";
import { ElevatedSection } from "../components/Section";
import { sizes } from "../style";
import { FeedPart } from "./FeedScreen";


export const SearchScreen = (props: { navigation: NavigationProp<any> } & { route: { params: {} } }) => {
    const [searchText, setSearchText] = useState(""),
        [searchType, setSearchType] = useState<"posts" | "people">("posts"),
        [people, setPeople] = useState<Interface.IUserList[]>(),
        debounceRef = useRef<any>()

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (searchType === "people") {
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
                }, 500)
            }
            else {
                setPeople(undefined);
            }
        }
    }, [searchText, searchType])

    return (
        <View style={{ flex: 1, backgroundColor: "#F7f8f8" }}>
            <SearchBar onTextChange={(v) => {
                setSearchText(v);
            }} />
            <ButtonGroup
                style={{ margin: sizes.rem1, width: "auto" }}
                unselectedStyle={{
                    backgroundColor: "#35A265",
                }}
                
                value={searchType}
                onValueChange={(value) => {
                    setSearchType(value);
                    setPeople(undefined);
                }} items={[{ label: "Analysts", "value": "people" }, { label: "Posts", value: "posts" }]} />
            {searchType === "posts" && <FeedPart searchText={searchText} />}
            {searchType === "people" && <View
                style={{ marginHorizontal: sizes.rem1, flex: 1 }}><List
                    data={people}
                    loadingMessage={"Search For People"}
                    loadingItem={undefined}
                    renderItem={(item) => {
                        return <ElevatedSection title="">
                            <ProfileBar user={item.item} style={{marginBottom:-sizes.rem0_5}} />
                        </ElevatedSection>
                    }}
                /></View>}
            {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                <EditScreenInfo path="/screens/TabOneScreen.tsx" /> */}
        </View>
    );
}
