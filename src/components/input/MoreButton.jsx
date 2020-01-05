import React from "react";
import { PureComponent } from "react";

export default class MoreButton extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }


    render() {
        return (
            <>
                <div className="more" data-active={this.state.active} onClick={() => {
                    this.setState({
                        active: !this.state.active
                    }) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                </div>
                <div className="moreMenu" onClick={(e) => { this.setState({ active: false }) }}>
                    <div className="moreMenuBlock"></div>
                    <ul>
                        {this.props.children}
                    </ul>
                </div>
            </>
        )
    }

}