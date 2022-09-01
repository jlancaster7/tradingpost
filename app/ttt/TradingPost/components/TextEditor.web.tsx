//react-native-pell-rich-editor
import pell, { exec } from 'pell'
import { MutableRefObject } from 'react'

export const TextEditor = (props: {
    editorRef: MutableRefObject<any>
}) => {
    return <div ref={props.editorRef} />
}

export const TextEditorToolbar = (props: {
    editorRef: MutableRefObject<any>
}) => {
    return <div className='WTF' ref={(ref) => {
        if (ref) {
            console.log("INITING DIV REF" + props.editorRef.current.constructor.name)
            pell.init({
                element: ref,
                onChange: (html) => {
                    (props.editorRef.current as HTMLDivElement).innerHTML = html;
                },
                actions: ['bold',
                    'underline',
                    {
                        name: 'italic',
                        result: () => exec('italic')
                    },
                    {
                        name: 'backColor',
                        icon: '<div style="background-color:pink;">A</div>',
                        title: 'Highlight Color',
                        result: () => exec('backColor', 'pink')
                    },
                    {
                        name: 'image',
                        result: () => {
                            const url = window.prompt('Enter the image URL')
                            if (url) exec('insertImage', url)
                        }
                    },
                    {
                        name: 'link',
                        result: () => {
                            const url = window.prompt('Enter the link URL')
                            if (url) exec('createLink', url)
                        }
                    }]
            })
        }
    }}  ></div>
}