import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, FlatList, FlatListProps, ListRenderItem, ScrollView, View, ViewToken } from "react-native";
import { TBI } from "../utils/misc";
import { Link } from "./Link";
import { NoDataPanel } from "./NoDataPanel";


export type DataOrQuery<T> = T[] | ((data: T[] | undefined, page: number) => Promise<T[]>);
export type ListProps<T> = {
    data?: DataOrQuery<T>,
    noDataMessage?: string,
    loadingMessage?: string,
    maxDisaplyCount?: number,
    maxDisaplyText?: string
    datasetKey?: string | number,
    keyExtractor?: FlatListProps<T>["keyExtractor"]
}
type HasU<T, U> = U extends undefined | null ? T : (T | U);

export function List<T, U>(props: {
    //    data: ReadonlyArray<T> | null | undefined
    renderItem: ListRenderItem<HasU<T, U>> | null | undefined
    nestedScrollEnabled?: boolean,
    preloadOffset?: number,
    loadingItem: U
} & ListProps<T> & Pick<FlatListProps<HasU<T, U>>, "ListHeaderComponent" | "StickyHeaderComponent" | "keyExtractor">) {

    const [internalData, setInternalData] = useState<T[]>(),
        { data, preloadOffset, datasetKey } = props,
        [currentPage, setCurrentPage] = useState(0),
        [pagesDone, setPagesDone] = useState(false),
        isLoadingRef = useRef(true),
        [maxItem, setMaxItem] = useState(-1),
        [triggertHack, setTriggerHack] = useState(false);

    useEffect(() => {
        console.log("Render of data count  " + data?.length);
        setPagesDone(false);
        (async () => {
            if (typeof data == "function") {
                const result = await data(undefined, 0);
                if (!result.length) {
                    console.log("pages are done!!!!!!!!!!!!!");
                    setPagesDone(true);
                }

                setInternalData(result);
                console.log("Just set internal data to " + result.length)
                isLoadingRef.current = false;
            }
            else {
                console.log("Got to data with count " + data?.length);
                setInternalData(data)
                setPagesDone(true);
                isLoadingRef.current = false;
            }
        })()
    }, [datasetKey, Boolean(data)])

    useEffect(() => {
        if (!pagesDone && typeof data === 'function' && internalData) {
            if (!isLoadingRef.current) {
                const remaining = (internalData.length - 1) - maxItem;
                if (remaining <= (preloadOffset || 1)) {
                    isLoadingRef.current = true;
                    setTriggerHack((hack) => !hack);
                    const nextPage = currentPage + 1;
                    const originalLength = internalData.length
                    data(internalData, nextPage).then((newData) => {
                        if (newData.length === originalLength) {
                            isLoadingRef.current = false;
                            setPagesDone(true);
                        }
                        else {
                            setInternalData(newData);
                            setCurrentPage(nextPage);
                            isLoadingRef.current = false;
                        }

                    });
                }
                else {
                    //console.log("NOPE");
                }
            }
            else {
                //console.log("WHAT UP");
            }
        }

    }, [maxItem, internalData, preloadOffset, currentPage])

    const vp = useMemo(() => [
        {
            viewabilityConfig: {
                itemVisiblePercentThreshold: 20
            },
            onViewableItemsChanged: (ev: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
                let max = 0;
                ev.viewableItems.forEach((vi) => {
                    max = Math.max(max, vi.index || 0);
                });
                setMaxItem((curMax) =>
                    Math.max(max, curMax));
            },
        },
    ], []);
    const needsSplice = internalData && props.maxDisaplyCount && internalData.length > props.maxDisaplyCount;

    return !internalData?.length ? <NoDataPanel message={internalData ? props.noDataMessage : (props.loadingMessage || "Loading...")} /> :
        <FlatList
            ListHeaderComponent={props.ListHeaderComponent}
            ListFooterComponent={needsSplice ? () => {
                return <Link onPress={TBI} style={{ marginLeft: "auto" }}>{props.maxDisaplyText || "View All"}</Link>
            } : undefined}
            stickyHeaderIndices={props.ListHeaderComponent ? [0] : undefined}
            data={(isLoadingRef.current ? [...internalData, props.loadingItem] : (needsSplice ? internalData.slice(0, props.maxDisaplyCount) : internalData)) as HasU<T, U>[]}
            keyExtractor={props.keyExtractor}
            renderItem={props.renderItem}
            nestedScrollEnabled={props.nestedScrollEnabled}
            viewabilityConfigCallbackPairs={vp}
        />

    // return <ScrollView nestedScrollEnabled>
    //     <View
    //         style={{ backgroundColor: "purple", height: 1000, borderColor: "yellow", borderWidth: 2 }}
    //     ></View>
    // </ScrollView>
}