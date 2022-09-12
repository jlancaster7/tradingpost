import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, FlatList, FlatListProps, ListRenderItem, ScrollView, View, ViewToken } from "react-native";
import { flex } from "../style";
import { TBI } from "../utils/misc";
import { Link } from "./Link";
import { NoDataPanel } from "./NoDataPanel";


export type DataOrQuery<T> = T[] | ((data: T[] | undefined, page: number, sizeCache: SizeParts[]) => Promise<T[]>);
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
type SizeParts = { index: number, length: number, offset: number };
export function List<T, U>(props: {
    //    data: ReadonlyArray<T> | null | undefined
    maxPage?: number,
    renderItem: ListRenderItem<HasU<T, U>> | null | undefined
    nestedScrollEnabled?: boolean,
    preloadOffset?: number,
    loadingItem: U,
    getItemLayout?: ((
        data: Array<HasU<T, U>> | null | undefined,
        index: number,
        sizeCache: SizeParts[]
    ) => { length: number; offset: number; index: number }) | undefined;
} & ListProps<T> & Pick<FlatListProps<HasU<T, U>>, "numColumns" | "ListHeaderComponent" | "StickyHeaderComponent" | "keyExtractor">) {

    const [internalData, setInternalData] = useState<T[]>(),
        { data, preloadOffset, datasetKey } = props,
        [currentPage, setCurrentPage] = useState(0),
        [pagesDone, setPagesDone] = useState(false),
        isLoadingRef = useRef(true),
        [maxItem, setMaxItem] = useState(-1),
        [triggertHack, setTriggerHack] = useState(false),
        sizeCache = useRef<SizeParts[]>([]).current;

    useEffect(() => {
        setPagesDone(false);

        (async () => {
            if (typeof data == "function") {
                const result = await data(undefined, 0, sizeCache);
                if (!result.length || props.maxPage === 0) {
                    setPagesDone(true);
                }

                isLoadingRef.current = false;
                setInternalData(result);

            }
            else {
                isLoadingRef.current = false;
                setInternalData(data);
                setPagesDone(true);

            }
        })()
    }, [datasetKey, Boolean(data), props.maxPage])

    useEffect(() => {
        if (!pagesDone && typeof data === 'function' && internalData) {
            if (!isLoadingRef.current) {
                const remaining = (internalData.length - 1) - maxItem;
                if (remaining <= (preloadOffset || 1)) {
                    isLoadingRef.current = true;
                    setTriggerHack((hack) => !hack);
                    const nextPage = currentPage + 1;
                    const originalLength = internalData.length
                    data(internalData, nextPage, sizeCache).then((newData) => {
                        if (newData.length === originalLength || props.maxPage === nextPage) {
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

    }, [maxItem, internalData, preloadOffset, currentPage, props.maxPage])

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
            style={[{ height: "100%" }]}
            contentContainerStyle={[{ height: "100%" }]}
            getItemLayout={props.getItemLayout ? (a, b) => (props.getItemLayout as any)(a, b, sizeCache) : undefined}
            numColumns={props.numColumns}
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