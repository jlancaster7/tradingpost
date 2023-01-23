/* eslint-disable import/first */

import React, { useState, useRef, createRef, useEffect, ChangeEvent } from "react";
import {labels} from '../data/externalData'
import $ from 'jquery';
import './LabelPanel.css';
type LabelControlPanelType = {
    divKey: string 
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>
    newTitle: string
    setNewTitle: React.Dispatch<React.SetStateAction<string>>
    
}

export class LabelControlPanel extends React.Component<LabelControlPanelType, LabelControlPanelType> {
    constructor(props: LabelControlPanelType) {
        super(props)
        this.state = {
            divKey: props.divKey,
            title: props.title,
            setTitle: props.setTitle,
            newTitle: props.newTitle,
            setNewTitle: props.setNewTitle
        }
    }
    handleOptionChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
        
        this.setState({
            newTitle: changeEvent.target.value
        });
        this.state.setNewTitle(changeEvent.target.value)
      }
    
    render () { return (
        <>
            <div>
            <h2>
                Labels
            </h2>
            <form>
                {Object.keys(labels).map(a => {
                    return (
                        <div className="radio">
                            <label>
                                <input type="radio" value={`${a}`}
                                            checked={this.state.newTitle ? this.state.newTitle === `${a}` : this.state.title === `${a}`} 
                                            onChange={this.handleOptionChange} />
                                {a}
                            </label>
                        </div>
                    )
                })}
            </form>
            </div>
        </>
    )}
}