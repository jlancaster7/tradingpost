import { MutableRefObject, useRef } from 'react'
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor'

export const TextEditor = (
    props: { editorRef: MutableRefObject<any> }
) => {
    return <RichEditor ref={props.editorRef} />
}

export const TextEditorToolbar = (props: {
    editorRef: MutableRefObject<any>
}) => {
    //const editorRef = useRef<RichToolbar>(null)
    return <RichToolbar editor={props.editorRef} />
}