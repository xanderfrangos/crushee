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
            value: this.props.value || false
        }
    }



    render() {
        const keys = (this.props.path ? this.props.path.split(".") : false)
        return (
            <div className="row">
                <div className="col">
                    {makeLabel(this.props.label)}
                    {makeDescription(this.props.description)}
                </div>
                <div className="col">
                    <div className="input--toggle" data-value={(keys ? window.GlobalSettings.Quality[keys[0]][keys[1]] || false : this.props.value)} onClick={(e) => {
                        if(this.props.keys) {
                            window.GlobalSettings.Quality[keys[0]][keys[1]] = (window.GlobalSettings.Quality[keys[0]][keys[1]] === true ? false : true)
                            this.setState({ value: window.GlobalSettings.Quality[keys[0]][keys[1]] })
                            window.changeEventState("crushing", 0, false)
                            window.changeEventState("saving", 0, false)
                            window.sendUpdate()
                        } else {
                            if(typeof this.props.onChange == "function") {
                                this.props.onChange(e, !this.props.value, this)
                            }
                        }
                        
                    }}>
                        <div></div>
                    </div>
                </div>
            </div>
        )
    }

};