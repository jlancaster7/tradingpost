import React, { useEffect, useState } from "react"
import { Text } from "@ui-kitten/components"
//import { referenceData } from "../../apis/ReferenceData"
import { ChipPicker } from "../../components/ChipBar"
import { Section } from "../../components/Section"
import { PlusIcon } from "../../images"
import { flex } from "../../style"
import { Picker } from '../../components/Picker'
import {
    CreateAccountProps,
    sideMargin, useChangeLock
} from "../CreateAccountScreen"

import {
    //bindMultiPicker, bindPicker,
    useReadonlyEntity
} from "../../utils/hooks"
//import { UpdateUserProfile } from "../../apis/Authentication"
import { ChipTextField } from "../../components/ChipTextField"
import { ScrollWithButtons } from "../../components/ScrollWithButtons"
import { Alert, View } from "react-native"
//import { AppConfig } from "../../apis/ApplicationApi"

export function InvestmentInterestSection(props: CreateAccountProps) {
    const interestEntity = useReadonlyEntity({}
        //props.user.data.investment_interests || { interestLevel: 50 }

    );
    const [lockButtons, setLockButtons] = useChangeLock(props, [interestEntity]);


    return <ScrollWithButtons
        buttons={
            {
                locked: lockButtons,
                left: props.saveOnly ? undefined : {
                    text: "Not Now",
                    onPress: props.next
                },
                right: {
                    text: props.saveOnly ? "Apply" : "Continue",
                    onPress: async () => {
                        setLockButtons(true);
                        try {

                            //await UpdateUserProfile({ investment_interests: interestEntity.data });
                            //props.user.update({ investment_interests: interestEntity.data })
                            interestEntity.resetData(interestEntity.data);
                            props.user.resetData(props.user.data);

                            if (!props.saveOnly)
                                props.next();

                        } catch (ex: any) {
                            console.error(ex);
                            props.toastMessage("Unable to update profile");
                            setLockButtons(false);
                        }

                    }
                }
            }
        }>
        <View style={[flex, { margin: sideMargin }]}>
            <Section title={'Portfolio Strategy'}>
                {/* <Picker
                    placeholder='Select Strategy'
                    showSearch
                    topBarProps={{
                        title: "Portfolio Strategy"
                    } as ModalTopBarProps}
                    items={AppConfig.trading_strategies.map((value) => ({
                        label: value,
                        value
                    }))}
                    {...bindPicker(interestEntity, "strategy", null)}
                /> */}
            </Section>
            <Section title={'Investment Focus'}>
                {/* <ChipPicker
                    choices={AppConfig.chip_labels.map(l => ({
                        label: l,
                        value: l
                    }))}
                    allowMannualEntry
                    chipValues={interestEntity.data.focus?.map(f => ({
                        label: f,
                        value: f
                    }))}

                /> */}
                <Text style={{ fontSize: 16, marginBottom: 8 }}>How interested are you in diversifying your Investments?</Text>
                {/* <Slider
                    minimumValue={0}
                    maximumValue={100}
                    step={25}
                    value={interestEntity.data.interestLevel || 50}
                    onValueChange={(v) =>
                        interestEntity.update({
                            interestLevel: v
                        })}
                /> */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                    <Text style={{}}>Not Interested</Text>
                    <Text>Very Interested</Text>
                </View>
            </Section>
            <Section title='Benchmark'>
                {/* <Picker
                    placeholder='Select Benchmark'
                    showSearch
                    topBarProps={{
                        title: "Benchmark"
                    } as ModalTopBarProps}
                    items={AppConfig.benchmarks.map((value) => ({
                        label: value.benchmark,
                        value: value.id
                    }))}
                  //  {...bindPicker(interestEntity, "benchmark", null)}
                /> */}
            </Section>
            <Section title='Interest and Specialties'
            >
                {/* <ChipTextField
                    tags={interestEntity.data.interests}
                    placeholder="Add More..."
                    onChangeTags={(tags) => {
                        interestEntity.update({
                            interests: tags
                        })
                    }}

                /> */}
            </Section>
        </View>
    </ScrollWithButtons>
}

