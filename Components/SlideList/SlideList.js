import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './slidelist.css';

export default class SlideList extends Component {

    constructor(props) {
        super(props);
        this.state = { visible: false, gotHeight: false };
    }

    componentDidMount() {
        this.height = document.getElementById('shadow_contents').clientHeight + 20;
        this.setState({ gotHeight: true });
    }

    render() {
        return (
            <div className='slide-container'>
                {this.gotHeight && <div className='list-button' onClick={() => { this.setState({ visible: !this.state.visible }) }}>
                    {this.props.buttonText}
                    <i className={this.state.visible ? 'up' : 'down'} onClick={() => { this.setState({ visible: !this.state.visible }) }}></i>
                </div>}
                {this.gotHeight && <div style={{ height: this.state.visible ? this.height : 0, padding: this.state.visible ? 5 : 0 }}
                    className='list-contents'>
                    {this.props.content}
                </div>}
                {!this.gotHeight && <div className='list-contents' id='shadow_contents' style={{position: 'absolute', top: -10000}}>{this.props.content}</div>}
            </div>
        )
    }
}

SlideList.propTypes = {
    buttonText: PropTypes.string.isRequired,
    content: PropTypes.arrayOf(PropTypes.string).isRequired
}