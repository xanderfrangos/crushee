import React, { useState } from "react";

const downSVG = (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"/></svg>)

export default function InputDropdown(props) {

    const [selectedValue, setSelectedValue] = useState(props.value)
    const [showOptions, setShowOptions] = useState(false)

    const valueChanged = (value) => {
        setSelectedValue(value)
        if(props.onChange && typeof props.onChange === "function") {
            props.onChange(value)
        }
        setShowOptions(false)
    }

    let selectedOption = "No options available"
    if(props.options && props.options.length > 0) {
        const found = props.options.find(opt => opt.value === selectedValue)
        if(!found) {
            setSelectedValue(props.options[0].value)
        }
        selectedOption = (found ? found.html : props.options[0].html)
    }

    const renderOptions = () => {
        if(props.options && props.options.length > 0) {
            return props.options.map((option, idx) => {
                if(option.html) {
                    return (
                        <div key={idx} className="option" data-selected={(selectedValue === option.value ? true : false)} onClick={() => valueChanged(option.value)}>{option.html}</div>
                    )
                }
            })
        }
    }

    return (
        <div className="input--dropdown" data-value={selectedValue}>
            <div className="selected-preview"><div className="option" onClick={() => setShowOptions(!showOptions)}>{selectedOption}</div><div className="arrow">{downSVG}</div></div>
            <div className="options" style={{display:(showOptions ? "block" : "none")}}>
                { renderOptions() }
            </div>
        </div>
    )
}