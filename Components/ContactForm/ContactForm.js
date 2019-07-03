import React, { Component } from 'react';
import loading from './loading.jpeg';
import './contactform.scss';
import './media_queries.scss';

export default class ContactInfo extends Component {

    constructor() {
        super();
        this.state = {
            name: '',
            email: '',
            subject: '',
            message: '',
            showPrivacyMsg: false
        };
    }

    render() {
        return (
            <div className='box-text-info' style={{alignSelf: 'center'}}>
                <form className='gform' method='POST' onSubmit={() => document.querySelector('.submitting').style.display = 'flex'}
                    action='google sheet script goes here'>
                    <h3>Send me an email!</h3>
                    <input type='text' name='name' placeholder='Your Name' required
                        value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                    <input type='email' name='email' placeholder='Your Email' required
                        value={this.state.email} onChange={e => this.setState({ email: e.target.value })} />
                    <input type='text' name='subject' placeholder='Subject' required
                        value={this.state.subject} onChange={e => this.setState({ subject: e.target.value })} />
                    <input type='text' name='message' placeholder='Message' required
                        value={this.state.message} onChange={e => this.setState({ message: e.target.value })} />
                    <input type='submit' value='Submit' />
                </form>
                <div className='submitting' style={{display: 'none'}}>
                    <div>Submitting</div><img alt='loading' className='spin' style={{maxWidth: 20, maxHeight: 20, marginLeft: 10}} src={loading} />
                </div>
                <div style={{display: 'none', margin: 0}} className='thankyou_message'>
                    <h1>Thanks for reaching out!</h1>
                    <h3>I'll be sure to get back to you soon.</h3>
                </div>
                <div id='privacy-msg'>
                    <div>Privacy</div>
                    <div className='question-mark' onMouseOver={() => this.setState({ showPrivacyMsg: true})} onMouseOut={() => this.setState({ showPrivacyMsg: false})}>
                        ?
                        <div className='box-mini-info' style={{opacity: this.state.showPrivacyMsg ? 1 : 0}}>
                            The information you submit will be stored in a Google Sheet on my Google account so that I can get back to you as quickly and efficiently as possible!
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}