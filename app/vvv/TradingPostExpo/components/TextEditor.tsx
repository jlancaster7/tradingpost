import { MutableRefObject, PropsWithRef, useRef } from 'react'
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor'

export const TextEditor = (
    props: PropsWithRef<{
        editorRef?: MutableRefObject<any>,
        html: string,
        onChangeHtml: (text:string)=>void
    }>
) => {
    return <RichEditor ref={props.editorRef} />
}

export const TextEditorToolbar = (props: {
    editorRef: MutableRefObject<any>
}) => {
    //const editorRef = useRef<RichToolbar>(null)
    return <RichToolbar editor={props.editorRef} />
}