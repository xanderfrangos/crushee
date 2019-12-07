import React from 'react';
import InputSlider from "./InputSlider";
export const FormattedSlider = (props) => {

    const keys = props.path.split(".")

    return (
        <div className="row">
            <div className="col flex-1">
                <label>{props.name}</label>
                <InputSlider level={window.GlobalSettings.Quality[keys[0]][keys[1]] || 0} onChange={(newVal) => { window.GlobalSettings.Quality[keys[0]][keys[1]] = newVal }} min={props.min || 0} max={props.max || 100} />
            </div>
        </div>
    )
}