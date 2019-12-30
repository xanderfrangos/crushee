import React from 'react';
import InputSlider from "./InputSlider";
export const FormattedSlider = (props) => {

    const keys = props.path.split(".")

    return (
        <div className="row">
            <div className="col flex-1">
                <label>{props.name}</label>
                <div className="sublabel">{props.description}</div>
                <InputSlider level={window.GlobalSettings.Quality[keys[0]][keys[1]] || 0} onChange={(newVal) => { if(typeof props.onChange === "function") props.onChange(newVal); window.GlobalSettings.Quality[keys[0]][keys[1]] = newVal; window.changeEventState("crushing", 0); window.changeEventState("saving", 0) }} min={props.min || 0} max={props.max || 100} scrolling={false} />
            </div>
        </div>
    )
}