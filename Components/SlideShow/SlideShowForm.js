import React, {Component} from 'react';
import axios from 'axios';
import './slideshow.css';
/* Not in this directory */
import EC2 from '../server/SERVER';

export default class SlideShowForm extends Component {

    constructor() {
        super();
        this.state = {
            network_error: false,
            file_path: '',
            selected_file: null,
        }
    }

    submitFile = e => {
        e.preventDefault();
        if (this.state.selected_file !== null) {
            let form_data = new FormData();
            form_data.append('image', this.state.selected_file);
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };

            axios.post(EC2 + '/upload', form_data, config)
            .then(res => {
                console.log('Req complete, res data:', res.data);
                const new_img = require('./uploads/' + res.data.filename);
                this.props.callback({ imgs: [...this.props.imgs].concat(new_img) });
            })
            .catch(err => {
                console.log(err);
                this.props.callback({ network_error: true });
            });
        }
    }

    handleFileSelection = e => {
        e.preventDefault();
        this.setState({
            file_path: e.target.value, 
            selected_file: e.target.files[0]
        });
    }

    render() {
        return (
        <form className='file-wrapper' onSubmit={this.submitFile} encType="multipart/form-data" style={{position: "absolute", bottom: 150}}> 
            <input type='file' name='enter filename' value={this.state.file_path} id='file-form'
                onChange={this.handleFileSelection} multiple />
            <div className='file-display'>
                <input name='fake file' value={this.state.file_path} readOnly />
                <button type='submit' name='choose'>Choose File</button>
                <input type='submit' name='upload' id='upload' value='Upload'
                    style={{display: this.state.file_path.length === 0 ? 'none' : 'block'}} />
                <button onClick={() => axios.delete(EC2 + '/delete/imgs')}>Delete Images</button>
            </div>
        </form>
        )
     }
}
