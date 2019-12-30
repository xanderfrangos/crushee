import React from "react";
import { PureComponent } from "react";


const makeLabel = (label) => {
    if (label) {
        return (
            <label>{label}</label>
        )
    }
}

const makeDescription = (label) => {
    if (label) {
        return (
            <div className="sublabel">{label}</div>
        )
    }
}

export default class InputToggle extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            value: false
        }
    }



    render() {
        const keys = this.props.path.split(".")
        return (
            <div className="row">
                <div className="col">
                    {makeLabel(this.props.label)}
                    {makeDescription(this.props.description)}
                </div>
                <div className="col">
                    <div className="input--toggle" data-value={window.GlobalSettings.Quality[keys[0]][keys[1]] || false} onClick={(e) => {
                        window.GlobalSettings.Quality[keys[0]][keys[1]] = (window.GlobalSettings.Quality[keys[0]][keys[1]] === true ? false : true)
                        this.setState({ value: window.GlobalSettings.Quality[keys[0]][keys[1]] })
                        window.changeEventState("crushing", 0)
                        window.changeEventState("saving", 0)
                    }}>
                        <div></div>
                        <input type="hidden" value={window.GlobalSettings.Quality[keys[0]][keys[1]] || false} />
                    </div>
                </div>
            </div>
        )
    }

};