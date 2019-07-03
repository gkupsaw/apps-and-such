import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './sidebar.scss';
import './media_queries.scss';

export default class SideBar extends Component {

    render() {
        let links = [], altLinks=[], social = [];
        this.props.links.forEach(link => {  //links to other parts of the site
            links.push(<Link key={link} to={link[0]}><div className='sidebar-item'>{link[1]}</div></Link>);
        });
        this.props.links.forEach(link => {  //for mobile, sidebar becomes navbar and links become icons
            altLinks.push(<Link key={link} to={link[0]}><img className='icon' alt='nav icon' src={link[2]} /></Link>);
        });
        this.props.social.forEach(icon => { //icons for/links to social media
            social.push(<a key={icon} href={icon[0]}><img className='icon' alt='social media icon' src={require(icon[1])} /></a>)
        });
        return (
            <div id='sidebar'>
                <img id='profile-pic' src={this.props.profilePic} alt='profile' />
                <div className='box-bio'>{this.props.bio}</div>
                <div className='box-links'>{links}</div>
                <div id='icons' className='box-icons'>{social}</div>
                <div id='alt-icons' className='box-icons'>{altLinks}{social}</div>
            </div>
        );
    }
}

/* links props must be of form [[link one, link one name, link one alt icon], 
                                [link two, link two name, link two alt icon],
                                ... ,
                                [link n, link n name, link n alt icon]]
*/

/* social props must be of form [[social media link one, social media link one name],
                                [social media link two, social media link two name],
                                ... ,
                                [social media link n, social media link n name],
*/

SideBar.PropTypes = {
    links: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    social: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
}