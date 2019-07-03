import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './fancylist.css';

export default class FancyList extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            visible: false
         };
    }

    renderContent = () => {
        let items = [];
        for (let i in this.props.content) {
            items.push(
                <div key={this.props.content[i]} 
                    id={i} 
                    className='list-item' 
                    style={{backgroundColor: this.props.noBackground ? 'transparent' : 'initial'}} 
                    onClick={this.props.events !== undefined ? this.props.events[i] : () => {}}>
                    {this.props.content[i]}
                </div>
            );
        }
        return items;
    }

    render() {
        const content = this.renderContent();

        return (
            <div className='list' 
                onMouseOver={() => this.setState({ visible: true })} 
                onMouseOut={() => this.setState({ visible: false })}>
                <div className='list-header' style={{backgroundColor: this.props.noBackground ? 'transparent' : 'initial'}}>
                    {this.props.header}
                </div>
                <div className={this.state.visible ? 'list-content-visible' : 'list-content-hidden'}>
                    {content}
                </div>
            </div>
        )
    }
}

FancyList.propTypes = {
    noBackground: PropTypes.bool.isRequired,
    events: PropTypes.arrayOf(PropTypes.func).isRequired,
    header: PropTypes.string.isRequired,
    content: PropTypes.arrayOf(PropTypes.string).isRequired
}
