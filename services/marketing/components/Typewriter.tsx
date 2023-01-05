import React, {useState, useEffect} from 'react';



const DEFAULT_MS = 90;

export interface ITypewriterProps {
    text: string | string[];
    speed?: number;
    loop?: boolean;
    random?: number;
    delay?: number;
    cursor?: boolean;
    onFinished?: Function;
    onStart?: Function;
    mount?: boolean;
}

export default function Typewriter({text, speed = DEFAULT_MS, loop = false, random = DEFAULT_MS, delay = DEFAULT_MS, cursor = true, onFinished = () => {}, onStart = () => {}, mount = false}: ITypewriterProps) {
    
    const [currentStringIndex, setCurrentStringIndex] = useState(0);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    if (!Array.isArray(text))
        text = [text]
    useEffect(() => {
        if (mount) {
            console.log(mount)
            setTimeout( () => {
                setCurrentTextIndex(0);
                setCurrentStringIndex(0);
            }, 0)
        }
    }, [mount])
    
        


    useEffect( () => {
        setTimeout( () => {
            if (currentTextIndex === 0)
                onStart();
            if (currentTextIndex < text[currentStringIndex].length) {
                setCurrentTextIndex(currentTextIndex + 1);
            } else {
                if (currentStringIndex < text.length-1) {
                    setTimeout( () => {
                        setCurrentTextIndex(0);
                        setCurrentStringIndex( currentStringIndex + 1);
                    }, delay);
                } else {
                    if (loop) {
                        setTimeout( () => {
                            setCurrentTextIndex(0);
                            setCurrentStringIndex(0);
                        }, delay);
                    } else {
                        
                        onFinished();
                    }
                }
            }
        }, speed + (Math.random() * random));
    });

    return (
        <span>
            {
                text[currentStringIndex].substring(0, currentTextIndex)
            }
            <span className='cursor'>
            {
                cursor && '▎'
            }
            </span>
        </span>
    );
}

