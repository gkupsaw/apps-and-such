import React, {Component} from 'react';
import Animations from './Animations';
import PropTypes from 'prop-types';
import './interactivelist.css';

export default class InteractiveItem extends Component {

    componentDidUpdate() {
        Animations.animate(this.props.current_animation, this.props.data.id);
    }

    scrollToTop(id) {   //display is the container holding the items
        let scrollTop = document.getElementById('display').scrollTop;
        if (scrollTop <= 0) {
            document.getElementById('display').scrollTop = 0;
            clearInterval(id);
        } else {
            document.getElementById('display').scrollTop = scrollTop - scrollTop/10;
        }
    }

    render() {
        const item_data = this.props.data;
        const message = item_data.favorited ? '★' + item_data.message : item_data.message;
        return (
            <div id={item_data.id}
                key={item_data.id}
                onClick={this.props.becomeFavorited}
                className='item'
                style={{backgroundColor: item_data.favorited ? 'gold' : ''}}>
                <div className='more' 
                    onClick={e => {
                        e.stopPropagation();
                        this.props.triggerPopup(this.props.data)
                        let id = setInterval(() => this.scrollToTop(id), 20);
                    }}>
                    &#43;</div>
                {message}
                <br/><br/>
                &#9829;&#9829;&#9829;{item_data.name}&#9829;&#9829;&#9829;
            </div>
        )
     }
}

InteractiveItem.propTypes = { //item must be a child of an element with id 'display'
    becomeFavorited: PropTypes.func.isRequired,
    triggerPopup: PropTypes.func.isRequired,
    current_animation: PropTypes.string.isRequired,
    data: PropTypes.objectOf({
        id: PropTypes.string.isRequired,
        favorited: PropTypes.bool.isRequired,
        message: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })
}
