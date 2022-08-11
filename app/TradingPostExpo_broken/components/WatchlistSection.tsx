import React, { useEffect, useState } from "react"
import { Pressable, Text } from "react-native"
import { ensureCurrentUser } from "../apis/Authentication"
import { getByCreatorId, IWatchlist, listWatchlist, ListWatchlistItem, Watchlist } from "../apis/WatchlistApi"
import { PlusIcon } from "../images"
import { IUserInfo } from "../interfaces/IUserInfo"
import { fullDashOptions, fullScreenProps, fullScreenSettings } from "../layouts/DashboardLayout"
import { screens } from "../navigationComponents"
import { sizes } from "../style"
import { Section } from "./Section"
import { ITableColumn, Table } from "./Table"


export function WatchlistSection(props: { parentComponentId: string, isShared?: boolean, userId: string }) {
    const { isShared, userId } = props;
    const currentUser = ensureCurrentUser();
    const [watchlist, setWatchlist] = useState<ListWatchlistItem[]>()
    const [creator, setCreatorInfo] = useState<IUserInfo>()

    useEffect(() => {
        (async () => {
            const watchlists = await listWatchlist({ creator_id: currentUser.id });
            setWatchlist(watchlists.watchlists);
            setCreatorInfo(watchlists.creator);
            console.log("")
            //setWatchlist(await getByCreatorId({ creator_id: "" }))

        })()
    }, [isShared])

    console.log("MY WATCHLIST IS :" + JSON.stringify(watchlist));

    let titlePrefix = userId === currentUser.id ? "Your " : "";
    let columns: ITableColumn<ListWatchlistItem>[] = [
        {
            field: "name",
            alias: "Name",
            align: "left"
        },
        {
            alias: "Creator",
            width: 120,
            stringify: () => creator?.username || ""
        },
        {
            field: "num_items",
            alias: "Item #",
            width: 48
        }
    ];

    if (isShared)
        titlePrefix = "Shared ";

    return <Section title={titlePrefix + 'Watchlists'} button={({ height, width }) => {
        return <Pressable onPress={() => {
            screens.push(props.parentComponentId, "UpsertWatchlist", fullScreenSettings);
        }}><PlusIcon height={height} width={width} />
        </Pressable>
    }}>
        <Table
            elevated
            rowPressed={(item) => {
                screens.push(props.parentComponentId, "Watchlist", {
                    options: fullDashOptions,
                    passProps: {
                        ...fullScreenProps,
                        watchlistId: item.id
                    }
                })
            }}
            columns={columns.filter((c) => isShared || c.alias !== "Creator")}
            data={watchlist}
        />
    </Section>
}
