import React from 'react'
import { MutableRefObject, PropsWithRef, useRef } from 'react'
import { Text } from 'react-native'
export const TextEditor = (
    props: PropsWithRef<{
        editorRef?: MutableRefObject<any>,
        html: string,
        onChangeHtml: (text: string) => void
    }>
) => {
    return <Text>test</Text>
}
