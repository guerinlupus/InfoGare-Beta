import React, { Component } from 'react';

import $ from 'jquery';

import "../index.scss";

import OneRowDepart from './OneRowDepart';
import TwoRowDepart from './TwoRowDepart';
import { get, getDatabase, onValue, orderByChild, query, ref } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { createRoot } from 'react-dom/client';

class ArrivePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.checkScroll = this.checkScroll.bind(this);
        this.infosText = React.createRef();
    }

    render() {
        return (
            <div className='rows rows-arrivals'>
                <div className='row-background'></div>
                <div className='row-group row-group-bar'>
                    <div className='row'>
                        <div className='col-first'>
                            <div className='bar-informations text-scroll-x' ref={this.infosText}>Test</div>
                        </div>
                        <div className='col-second'>
                            <div className='bar-clock'>
                                <span id='clock-hours'></span>
                                <span className='animation-blink'>
                                    <span className='animation-blink-clock'>:</span>
                                </span>
                                <span id='clock-minutes'></span>
                                <small id='clock-seconds'></small>
                            </div>
                        </div>
                    </div>
                </div>
                <div id='group'>

                </div>
            </div>
        );
    }

    scrollX() {

        $('.text-scroll-x').each(function () {

            var distance = $(this).width() + $(this).parent().width() + 10;


            if ($(this).width() > $(this).parent().width()) {
                $(this).addClass('animation-scroll-x');
                $(this).css({
                    '-webkit-animation-duration': (distance / 150) + 's',
                    'animation-duration': (distance / 150) + 's',
                    'padding-left': '100%'
                });
            } else {
                $(this).css({
                    'padding-left': '0%'
                });
            }
        });
    }

    /* -- scrollY -- */

    scrollY(limit) {

        var elem = $('.scroll-y');
        var elemHeight = elem.height();
        var parentHeight = elem.parent().height();
        var elemHeightRelative = elemHeight / parentHeight * 100;

        if (elemHeightRelative > limit && limit < 100) {
            var distance = (elemHeight - (parentHeight / 1.1)) / $(window).height() * 100;
            var time = distance / 6 + 10;
            var delay = 5 / time * 100;

            $("<style type='text/css'> @keyframes scrollY{ 0%, " + delay + "%{ transform:translateY(0%); } " + (100 - delay) + "%, 100%{ transform:translateY(-" + distance + "vh); } } </style>").appendTo("head");
            $(elem).css({
                'animation': 'scrollY ' + time + 's linear infinite 0s'
            });
        } else {
            $(elem).css({
                'animation': 'none'
            });
        }
    }

    /* -- clock -- */

    clock() {
        var date = new Date();
        date.setHours(date.getHours() + (date.getTimezoneOffset() / -60));

        var h = date.getUTCHours();
        if (h < 10) {
            h = '0' + h;
        }
        $('#clock-hours').html(h);
        var m = date.getUTCMinutes();
        if (m < 10) {
            m = '0' + m;
        }
        $('#clock-minutes').html(m);
        var s = date.getUTCSeconds();
        if (s < 10) {
            s = '0' + s;
        }
        $('#clock-seconds').html(s);
        setInterval(this.clock, '1000');
        return true;
    }

    componentDidMount() {
        window.screen.orientation.lock('landscape').then(() => {
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            }
        }).catch((error) => {
            console.error(error);
        });

        const db = getDatabase();
        const uid = getAuth().currentUser.uid;
        const id = this.props.id;
        const trains = query(ref(db, 'users/' + uid + '/gares/' + id + '/trains'), orderByChild('hourarrive'));
        get(ref(db, 'users/' + uid + '/gares/' + id)).then(data => {
            const elements = [];
            var i = 0;
            this.infosText.current.innerHTML = data.child('infos').val().replaceAll('<br>', '&nbsp;');
            get(trains).then(departs => {
                departs.forEach(train => {
                    if (train.child('hourarrive').val().length > 0) {
                        let timing;
                        if (train.child('retardtype').val() === 'alheure') {
                            timing = 'à l\'heure';
                        } else if (train.child('retardtype').val() === 'retindet') {
                            timing = 'ret. indet.';
                        } else if (train.child('retardtype').val() === 'ret') {
                            timing = 'retard ' + train.child('retardtime').val() + ' min.';
                        } else {
                            timing = 'supprimé';
                        }

                        if (i < 2) {
                            elements.push(<TwoRowDepart key={train.id} type={train.child('type').val()} typename={train.child('typename').val()} number={train.child('number').val()} timing={timing} time={train.child('hourarrive').val()} track={train.child('voie').val()} hall={train.child('hall').val()} gare={train.child('provenance').val()} gares={train.child('from').val()} />);
                        } else if (i < 7) {
                            elements.push(<OneRowDepart key={train.id} type={train.child('type').val()} typename={train.child('typename').val()} number={train.child('number').val()} timing={timing} time={train.child('hourarrive').val()} track={train.child('voie').val()} hall={train.child('hall').val()} gare={train.child('provenance').val()} />);
                        }
                        i++;
                    }
                });
                const root = createRoot(document.getElementById('group'));
                root.render(elements);
            });
        });

        onValue(trains, (departs) => {
            const elements = [];
            var i = 0;
            departs.forEach(train => {
                if (train.child('hourarrive').val().length > 0) {
                    let timing;
                    if (train.child('retardtype').val() === 'alheure') {
                        timing = 'à l\'heure';
                    } else if (train.child('retardtype').val() === 'retindet') {
                        timing = 'ret. indet.';
                    } else if (train.child('retardtype').val() === 'ret') {
                        timing = 'retard ' + train.child('retardtime').val() + ' min.';
                    } else {
                        timing = 'supprimé';
                    }

                    if (i < 2) {
                        elements.push(<TwoRowDepart key={train.id} type={train.child('type').val()} number={train.child('number').val()} timing={timing} time={train.child('hourarrive').val()} track={train.child('voie').val()} gare={train.child('provenance').val()} gares={train.child('from').val()} />);
                    } else if (i < 8) {
                        elements.push(<OneRowDepart key={train.id} type={train.child('type').val()} number={train.child('number').val()} timing={timing} time={train.child('hourarrive').val()} track={train.child('voie').val()} gare={train.child('provenance').val()} />);
                    }
                    i++;
                }
            });
            const root = createRoot(document.getElementById('group'));
            root.render(elements);
        })

        this.clock();
        this.scrollX();
        this.scrollY(50);
        setInterval(() => {
            this.scrollX();
            this.scrollY(50);
        }, 500);
    }
}

export default ArrivePage;