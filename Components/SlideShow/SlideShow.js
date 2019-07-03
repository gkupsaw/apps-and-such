import React, {Component} from 'react';
import axios from 'axios';
import SlideShowForm from './SlideShowForm';
import './slideshow.css';
/* Not in this directory */
import EC2 from '../server/SERVER';
import NetworkError from '../ErrorHandling/NetworkError';

export default class SlideShow extends Component {

    constructor() {
        super();
        this.img_transition = 10000;
        this.state = {
            imgs: [],
            available_imgs: [],
            network_error: false,
            img_one_src: null,
            img_two_src: null
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidMount() {
        axios.get(EC2 + '/pictures')
        .then(res => {
            console.log('Server up and running! Received', res.data.length, 'pictures');
            let imgs = res.data;
                img;
            for (let i in imgs) {   //use filenames to require images
                img = require('./uploads/' + imgs[i].data.filename);
                imgs[i] = img;
            }
            this.setState({ imgs });

            document.getElementById('one').style.opacity = 1;   //make one img fade in
            const img_1 = this.pickNewImg([...this.state.imgs]);    //assign sources to each img
            const img_2 = this.pickNewImg(img_1.available_imgs);
            this.interval = setInterval(this.intervalFunc, this.img_transition);    //interval for fade in/out
            this.setState({ 
                img_one_src: img_1.chosen_src,
                img_two_src: img_2.chosen_src,
                available_imgs: img_2.available_imgs    //all sources except img_one_src & img_one_src
             });
        })
        .catch(err => { //request was not received, server is down/referencing wrong server/no internet
            console.log(err);
            this.setState({ network_error: err });
        })
    }

    //Returns object with keys available_imgs and chosen_src
    pickNewImg = available_imgs => {
        // console.log('picking')
        if (available_imgs.length === 0) available_imgs = [...this.state.imgs]; //resets available_imgs when all sources have been used
        const rand_index = Math.floor(Math.random()*available_imgs.length);
        const chosen_src = available_imgs[rand_index];  //choose a random available source
        available_imgs.splice(rand_index, 1);   //remove the source chosen one line above from available_imgs

        return { available_imgs, chosen_src };
    }

    //function called every {this.img_transition} ms
    intervalFunc = () => {
        const next_img = this.pickNewImg(this.state.available_imgs);
        // console.log('Next IMG:',next_img)
        let one = document.getElementById('one');
        let two = document.getElementById('two');
        let one_opacity;
        try {
            one_opacity = one.style.opacity;  //used by logic determining img opacity, could be two_opacity with logic reversed
            let state;  //object that will contain the source chosen above and all unused sources (exclusive of the one chosen)
            if (one_opacity <= 0.5) state = {img_one_src: next_img.chosen_src, available_imgs: next_img.available_imgs}
            else if (two.style.opacity <= 0.5) state = {img_two_src: next_img.chosen_src, available_imgs: next_img.available_imgs};

            one.style.opacity = (one_opacity >= 0.5) ? 0 : 1; //error of .5 just in case opacity gets messed up
            two.style.opacity = (one_opacity <= 0.5) ? 0 : 1;
            this.setState(state);
        } catch {
            console.log('Issue reading opacity of first image');
        }
    }

    render() {
        return (
            <div className='content' style={{width: 'fit-content', height: 'fit-content'}}>
                <NetworkError network_error = {this.state.network_error} error={'Image(s) not loaded/submitted'} />
                {!this.state.network_error &&
                    <div className='content' style={{width: 'fit-content', height: 'fit-content'}}>
                        <img id='one' className='slideshow-img' src={this.state.img_one_src} alt={'family pic'} />
                        <img id='two' className='slideshow-img' src={this.state.img_two_src} alt={'family pic'} />
                        <SlideShowForm imgs={this.state.imgs} callback={new_src => this.setState( new_src )} />
                    </div>
                }
            </div>
        )
     }
}
