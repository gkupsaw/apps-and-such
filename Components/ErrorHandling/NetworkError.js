import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './networkerror.css'
/* Not in this directory */
import EC2 from '../server/SERVER';

export default class NetworkError extends Component {

    render() {
        let tip;
        const err = this.props.network_error;
        if (err.response) tip = <p className='error'>Reason: Bad request</p>;
        else if (err.request) tip = <p className='error'>Reason: Server is down</p>;
        else tip = <p className='error'>Reason: Could not connect. Check your connection, reload the page, and try again</p>;
        return !this.props.network_error ? <div /> : 
            <div className='container-error'>
                <p className='error'>Network Error: {this.props.error}</p>
                <p className='error'>Attempt to connect to {EC2} failed</p>
                {tip}
            </div>;
    }
}

NetworkError.propTypes = {
    err: PropTypes.string.isRequired,
    network_error: PropTypes.bool.isRequired
}