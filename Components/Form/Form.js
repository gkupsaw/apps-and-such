import React, { Component } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import './form.css'
/* Not in this directory */
import EC2 from '../server/SERVER';
import NetworkError from '../ErrorHandling/NetworkError';

export default class Form extends Component {

    constructor(props)  {
        super(props);
        this.state = { 
            inputOne: '',
            inputTwo: '',
            network_error: false,
            submitted: false
        };
    }

    onSubmit = e => {
        e.preventDefault();
        const { inputOne, inputTwo } = this.state;
        axios.post(EC2 + '/route',  { inputOne, inputTwo })
            .then(this.setState({ submitted: true }))
            .catch(err => {
                console.log(err);
                this.setState({ network_error: err });
            });
    }

    render() {
        return (
        <div className='container'>
            <NetworkError network_error={this.state.network_error} error={'Form not submitted'} />
            {
                !this.state.submitted && !this.state.network_error && 
                <form onSubmit={this.onSubmit}>
                    <input name='input one' type="text" placeholder='First Input' autoComplete='off'
                        value={this.state.inputOne} onChange={(event) => {this.setState({ inputOne: event.target.value })}} required />
                    <input name='name' type="text" placeholder='Your Name' autoComplete='off'
                        value={this.state.inputTwo} onChange={(event) => {this.setState({ inputTwo: event.target.value })}} required />
                    <input name='submit' type='submit' value='Submit' />
                </form>
            }
            {
                this.state.submitted && !this.state.network_error &&
                <div>
                    <p className='submitted'>Submitted!</p>
                    <p className='submitted'>Click<Link to={'/'}><button>here</button></Link>to go somewhere elsee.</p>
                    <p className='submitted'>Click<button onClick={() => this.setState({ submitted: false })}>here</button>to submit again.</p>
                </div>
            }
        </div>
        )
     }
}
