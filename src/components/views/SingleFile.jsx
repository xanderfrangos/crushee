import React from "react";
import { PureComponent } from "react";

export default class SingleFile extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            width: 0
        }
    }

    comparisonMove = (e) => {
        this.setState({
            width: e.pageX
        })
    }

    render() {
        return (
            <div className="page page--comparison" onMouseMove={ this.comparisonMove } style={ {display: (this.props.show ? "block" : "none") } } onClick={ () => window.sendPreviewUpdate(false) }>
                <div className="bg"></div>
                <div className="inner">
                    <div className="divider-wrap" style={ {width: this.state.width + "px"} }>
                        <div className="bar"></div>
                        <div className="inner">
                            <div className="item before" style={ {backgroundImage: `url("${this.props.before}")`} }></div>
                        </div>
                    </div>
                    <div className="item after" style={ {backgroundImage: `url("${this.props.after}")`} }></div>
                </div>
            </div>
        )
    }
}
