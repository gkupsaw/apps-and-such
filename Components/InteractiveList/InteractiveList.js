import React, {Component} from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import openSocket from 'socket.io-client';
import InteractiveItem from './InteractiveItem';
import PopupItem from './PopupItem';
import Algos from './Sorting'
import './interactivelist.css';
/* Not in this directory */
import FancyList from '../FancyList/FancyList';
import NetworkError from '../ErrorHandling/NetworkError';
import Loading from '../LoadingMessage/Loading';
import EC2 from '../server/SERVER';

export default class items extends Component {

    constructor(props)  {
        super(props);
        this.state = {
            network_error: false,
            loading: true,
            /* Visual organization of items */
            organize_by_fav: false,
            organize_oldest_first: true,
            /* List of data objects representing items */
            items_data: [],
            /* Props for items/popups */
            animation: 'none',
            item_currently_selected: false
        };
    }

    componentDidMount() {
        axios.get(EC2 + '/get/items') //get data objects representing items
            .then(res => {
                this.setupSocket(); //set up socket, real time updates for new items added
                this.setState({ 
                    loading: false, 
                    items_data: res.data,
                });
            })
            .catch(err => { //display error message
                console.log(err);
                this.setState({ 
                    network_error: err, 
                    loading: false 
                }); 
            });
    }

    setupSocket = () => {   //simple setup for socket
        this.socket = openSocket(EC2);
        this.socket.on('itemsUpdated', items => this.setState({ 
            items_data: items,
         }));
        this.socket.emit('join');
    }

    onItemSelected = selected_item => {
        if (!this.state.item_currently_selected) {   //prevents clashing of animations
            const popup = JSON.parse(JSON.stringify(selected_item));    //copy the data of selected item
            popup.id = popup.id + '-popup';
            this.popup = <PopupItem key={popup.id}  //create a popup representation of selected item
                            data={popup}
                            hide={() => {this.setState({ animation: 'items_appear', item_currently_selected: false })}}

                            becomeFavorited={() => this.socket.emit('itemFavorited', selected_item)} />;
            this.setState({ 
                animation: 'items_disappear', //all items disappear as popup appears
                item_currently_selected: true
            });
        }
    };

    organizeItems = items => {
        if (this.state.organize_by_fav) items = this.organizeFavFirst(items);
        else if (this.state.organize_oldest_first) items = Algos.mergeSort(items, 'oldest');
        else items = Algos.mergeSort(items, 'newest');

        let components = [];
        items.forEach(item => {
            components.push(<InteractiveItem key={item.id}
                data={item}
                current_animation = {this.state.animation}  //lets item know when it should appear/disappear
                triggerPopup = {this.onItemSelected}  //when the '+' is clicked
                becomeFavorited={() => this.socket.emit('itemFavorited', item)} />);
        });

        return components;
    }

    organizeFavFirst = items => {   //if items have are marked as favorited, put them first in the list
        let favorites = [];
        items.forEach(item => { if (item.favorited) favorites.push(item) });    //extract favorites
        items = items.filter(item => !item.favorited);  //extract non-favoritess
        return favorites.concat(items); //join lists, favorites first
    }

    render() {
        if (this.state.loading) {
            return (<Loading loading={this.state.loading} />);
        }
        const options = ['Date (Oldest First)', 'Date (Newest First)', 'Favorites'];    //settings options
        const events = [    //settings options' events, MUST MATCH ORDER OF OPTIONS
            () => this.setState({ organize_by_fav: false, organize_oldest_first: true }),
            () => this.setState({ organize_by_fav: false, organize_oldest_first: false }),
            () => this.setState({ organize_by_fav: true, organize_oldest_first: false })
        ];
        let items;  //only organize them if necessary (if they're visible)
        if (!this.state.item_currently_selected) items = this.organizeItems(this.state.items_data);

        return (
        <div className='content'>
            <NetworkError network_error = {this.state.network_error} error={'items not loaded'} />
            {
                !this.state.network_error &&
                <div className='content'>
                    <div className='settings'>
                        <FancyList 
                            header={[<div key='settings'>&#9881;</div>]}
                            content={[<FancyList header='<    Sort by    <' content={options} events={events} />]}
                            />
                    </div>
                    <div className='tip'>Click the + on a item to see the whole thing!</div>
                    <div className='tip'>Click on the background of it to favorite it</div>
                    <div className='tip'>Click<Link to={'/'}><button>here</button></Link>to submit a new item</div>
                    <div id='display' className='box-display'>
                        {this.popup}   {/* only renders if it is defined */}
                        {items} 
                    </div>
                </div>
            }
        </div>
        )
     }
}
