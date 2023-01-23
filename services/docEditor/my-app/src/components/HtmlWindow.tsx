/* eslint-disable import/first */

import React, { useState, useRef, createRef, useEffect } from "react";
import $ from 'jquery';
import { labels } from "../data/externalData";


export class HtmlWindow extends React.Component<HtmlWindowType, HtmlWindowType>  {
    constructor(props: HtmlWindowType) {
        super(props);
        
        this.state = {
            html: props.html,
            style: props.style,
            divKey: props.divKey,
            setDivKey: props.setDivKey,
            title: props.title,
            setTitle: props.setTitle,
            newTitle: props.newTitle,
            setNewTitle: props.setNewTitle
        };
    }
    formatElement = (jQel: JQuery<HTMLElement>, title: string) => {
        const cssFormatting = labels[title] || {};
        if (title === 'removedElement' || !title) {
            jQel.attr('style', '')
        }
        else {
            const cssStyle = Object.keys(cssFormatting).map(a => `${a}: ${cssFormatting[a]}`).join(' ')
            jQel.attr('style', cssStyle);
        }

    }
    handleClick = (el: HTMLElement) => {
        
        this.state.setTitle($(el).attr('title') || '')
        this.setState({title: $(el).attr('title') || ''})
        this.state.setDivKey($(el).attr('key') || '')
        this.setState({divKey: $(el).attr('key') || ''})
        
    }
    saveChanges = () => {
        console.log(this.state.newTitle)
        $(`[key="${this.state.divKey}"]`).attr('title', this.state.newTitle)
        this.formatElement($(`[key="${this.state.divKey}"]`), this.state.newTitle)
    }
    jQuerycode = () => {
        $('[id="tp_tag"]').on('click', (event) => {
            event.stopImmediatePropagation();
            if (this.state.title && this.state.divKey) {
                this.formatElement($(`[key="${this.state.divKey}"]`), 'removedElement')
                this.formatElement($(`[key="${this.state.divKey}"]`), this.state.title)
            }
            this.formatElement($(event.currentTarget), 'selectedElement')
            //$(event.currentTarget).css('border-style', 'solid');
            //$(event.currentTarget).css('border-color', 'gold');
            //$(event.currentTarget).css('border-width', 'medium');

            this.handleClick(event.currentTarget);  
        })
    }
    componentDidMount(): void {
        this.jQuerycode()
    }
    render() {
        return (
            <div>
                <div style={this.state.style}>
                    <div dangerouslySetInnerHTML={{__html: this.state.html}} />
                    
                </div>
                <button onClick={() => {
                    this.saveChanges()
                }}>
                    save changes
                </button>
            </div>

        )
    }
}


type HtmlWindowType = {
    html: string
    style: React.CSSProperties | undefined
    divKey: string
    setDivKey: React.Dispatch<React.SetStateAction<string>>
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    newTitle: string
    setNewTitle: React.Dispatch<React.SetStateAction<string>>
}

