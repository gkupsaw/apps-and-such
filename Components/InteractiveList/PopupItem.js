import React, {Component} from 'react';
import Animations from './Animations';
import PropTypes from 'prop-types';
import './interactivelist.css';

export default class PopupItem extends Component {

    componentDidMount() {
        Animations.animate('item_appear', this.props.data.id, {grow: true});
    }

    componentDidUpdate() {
        Animations.animate('item_appear', this.props.data.id, {grow: true});
    }

    render() {
        const item = this.props.data;
        const message = item.favorited ? '★' + item.message : item.message;
        return (
            <div id={item.id}
                key={item.id}
                onClick={this.props.onClick}
                className='item-popup'
                style={{backgroundColor: item.favorited ? 'gold' : ''}}>
                <div className='cross' 
                    onClick={e => {
                        e.stopPropagation();
                        Animations.animate('shrink', this.props.data.id);
                        this.props.hide();
                    }}>
                    &#10005;</div>
                {message}
                <br/><br/>
                &#9829;&#9829;&#9829;{item.name}&#9829;&#9829;&#9829;
            </div>
        )
     }
}

PopupItem.propTypes = {
    onClick: PropTypes.func.isRequired,
    hide: PropTypes.func.isRequired,
    current_animation: PropTypes.string.isRequired,
    data: PropTypes.objectOf({
        id: PropTypes.string.isRequired,
        favorited: PropTypes.bool.isRequired,
        message: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })
}
