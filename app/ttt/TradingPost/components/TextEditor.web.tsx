//react-native-pell-rich-editor
import pell, { exec } from 'pell'
import { useRef } from 'react'
import { useEffect } from 'react'
import { MutableRefObject, PropsWithRef, useState } from 'react'
import "../css/pell.css"
// export const TextEditor = (props: {
//     editorRef: MutableRefObject<any>
// }) => {
//     return <div ref={props.editorRef} />
// }

export const TextEditor = (props: PropsWithRef<{
    editorRef: MutableRefObject<any>,
    html: string,
    onChangeHtml: (text: string) => void
}>) => {
    const [html, setHtml] = useState(props.html)
    const divRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (divRef.current) {
            const editor = pell.init({
                element: divRef.current,
                onChange: (html) => {
                    //(props.editorRef.current as HTMLDivElement).innerHTML = html;
                    props.onChangeHtml(html);
                    setHtml(html);

                },
                actions: ['bold',
                    'underline',
                    'olist',
                    'ulist',
                    'italic',
                    {
                        name: 'backColor',
                        icon: '<div style="background-color:yellow;">A</div>',
                        title: 'Highlight Color',
                        result: () => exec('backColor', 'pink')
                    },
                    // {
                    //     name: 'image',
                    //     result: () => {
                    //         const url = window.prompt('Enter the image URL')
                    //         if (url) exec('insertImage', url)
                    //     }
                    // },
                    {
                        name: 'link',
                        result: () => {
                            const url = window.prompt('Enter the link URL')
                            if (url) exec('createLink', url)
                        }
                    }]
            })
            editor.content.innerHTML = html
        }
    }, []);


    return <div style={{
        backgroundColor: "#fefefe",
        display: "flex",
        flexGrow: 1,
        flexDirection: "column"
    }} className='WTF' ref={divRef}></div>
}