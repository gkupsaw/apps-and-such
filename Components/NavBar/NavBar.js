import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './navbar.css';

export default class NavBar extends Component {

    render() {
        const items = this.props.items;
        let nav = [], section_items = [];
        items.forEach(section => {
            section.forEach(item => {
                section_items.push(<div className='nav-item'>{item}</div>)
            });
            nav.push(<div className='nav-section'>{section_items}</div>);
            section_items = [];
        });
        return (
            <div className='nav-wrapper'>
                {nav}
            </div>
        );
    }

}

NavBar.propTypes = {
    items: PropTypes.array.isRequired
}