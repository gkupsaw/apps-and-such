import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './loading.css'

export default class Loading extends Component {

    genLoading()    {
        let divs = [], delay;
        const loading = 'Loading...';
        for (let i = 0 ; i < loading.length ; i++) {
            delay = i * 0.04 + 's';
            divs.push(<div key={i} className='loading' style={{animationDelay: delay}}>{loading[i]}</div>);
        }
        return divs;
    }

    render() {
        return (
            <div className={this.props.loading ? 'absolutely-centered' : 'absolutely-centered doneLoading'}>
                {this.genLoading()}
            </div>
        )
     }
}

Loading.propTypes = {
    loading: PropTypes.bool.isRequired
}