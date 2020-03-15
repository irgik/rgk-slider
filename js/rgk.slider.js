/*
 * rgk.slider
 * version: 1.6 (14.08.19)
 * Ivan Kolesnikov (myivanko@gmail.com)
 *
 *
 *
 rgk = {
    position: 0,
    touch: {
        started: false,
        detecting: false,
        position: [],
        delta: 0,
        duration: 0
    },
    sizes: {
        slider: 0,
        slide: 0,
        slides: 0,
        rest: 0,
        shift: 0
    },
    events: {}
 }
 
 ******************************************** */



function rgkSlider(selector, method, target) {

    var SliderAdd = function(el) {

        var slider = el;

        // if element already used by plugin
        if (slider.rgk) {
            return;
        }

        // mark element as rgk
        slider.rgk = {
            position: 0,
            touch: {
                started: false,
                detecting: false,
                position: [],
                delta: 0,
                duration: 0
            },
            sizes: {
                slider: 0,
                slide: 0,
                slides: 0,
                rest: 0,
                shift: 0
            },
            events: {
                'touchstart':   _ListenerTouchstart,
                'touchmove':    _ListenerTouchmove,
                'touchend':     _ListenerTouchend,
                'touchcancel':  _ListenerTouchend,
                'click':        _ListenerClick,
                'resize':       _ListenerResize
            }
        };

        // add element to window object
        if (!window.rgk) {
            window.rgk = { slider: [] };
        } else {
            if (!window.rgk.slider) window.rgk.slider = [];
        }
        if (!window.rgk.slider.length) {
            window.rgk.slider.push(slider.rgk.events['resize']);
        }
        window.rgk.slider.push(slider);

        SliderUpdate(slider);

        // add events listeners
        for (var evt in slider.rgk.events) {
            if (evt == 'resize') {
                window.addEventListener(evt, window.rgk.slider[0]);
            } else {
                slider.addEventListener(evt, slider.rgk.events[evt]);
            }
        }

        // trigger ready event
        var evt = new CustomEvent('ready.rgk.slider', {
            detail: {
                position: slider.rgk.position
            }
        });
        slider.dispatchEvent(evt);

    };

    var SliderUpdate = function(el) {

        var slider = el,
            container = slider.querySelector('.rgk-slider__slides'),
            slides = container.querySelectorAll('.rgk-slider__slide');

        // if element not used by plugin or no slides
        if (!slider.rgk || !slides.length) {
            return;
        }

        var position = slider.rgk.position || 0,
            index = Array.prototype.slice.call(slides).indexOf(container.querySelector('.is-active')),
            target = -1;

        if (slider.dataset.orientation == 'vertical') {
            slider.rgk.sizes.slider = container.getBoundingClientRect().height;
            slider.rgk.sizes.slide = slides[0].getBoundingClientRect().height;
        } else {
            slider.rgk.sizes.slider = container.getBoundingClientRect().width;
            slider.rgk.sizes.slide = slides[0].getBoundingClientRect().width;
        }

        slider.rgk.sizes.slides = slider.rgk.sizes.slide * slides.length;
        slider.rgk.sizes.rest = slider.rgk.sizes.slides - slider.rgk.sizes.slider;

        if (slider.rgk.sizes.slider >= slider.rgk.sizes.slides) {
            target = 0;
        } else {
            if (index > -1) {
                target = index;
            } else {
                target = position;
            }
        }

        var pager = slider.querySelector('[data-slide="page"]');

        if (pager) {

            var step = Math.floor(slider.rgk.sizes.slider / slider.rgk.sizes.slide),
                count = step > 0 ? slides.length / step : Math.ceil(slider.rgk.sizes.slide / slider.rgk.sizes.slider),
                links = '',
                title = '';

            if (step < 1) step = 1;

            for (var n = 0; n < count; n++) {
                title = slides[n * step].dataset.title || 'Slide '+ n * step;
                links += '<button class="rgk-slider__page" type="button" data-slide="'+ n * step +'">'+ title +'</button>';
            }

            pager.innerHTML = links;

        }

        SliderMoveTo(slider, target);

    };

    var SliderMoveTo = function(el, target) {

        var slider = el;

        // if element not used by plugin
        if (!slider.rgk) {
            return;
        }

        var container = slider.querySelector('.rgk-slider__slides'),
            slides = container.querySelectorAll('.rgk-slider__slide'),
            prev = false,
            next = false,
            index = -1,
            direction = false,
            previous = slider.rgk.position;

        switch (target) {
            case 'prev':
                prev = true;
                break;
            case 'next':
                next = true;
                break;
            case 'active':
                index = Array.prototype.slice.call(slides).indexOf(container.querySelector('.is-active'));
                break;
            case 'first':
                index = 0;
                break;
            case 'last':
                index = slides.length - 1;
                break;
            default:
                if (Number(target) == target && target%1 === 0 && target >= 0 && target < slides.length) {
                    index = target;
                } else {
                    return false;
                }
        }

        if (((slider.rgk.sizes.shift == 0) && prev) || ((slider.rgk.sizes.shift + slider.rgk.sizes.slider == slider.rgk.sizes.slides || slider.rgk.sizes.rest <= 0) && next) || (target == 'active' && index < 0)) {
            // trigger change event
            var evt = new CustomEvent('change.rgk.slider', {
                detail: {
                    position: -1,
                    previous: previous,
                    direction: target
                }
            });
            slider.dispatchEvent(evt);
            return false; // "Rgk Slider" navigation disabled
        }

        slider.rgk.sizes.rest = slider.rgk.sizes.slides - slider.rgk.sizes.slider - slider.rgk.sizes.shift;

        if (slider.rgk.sizes.slider >= slider.rgk.sizes.slides) {
            slider.rgk.sizes.shift = 0;
        } else if (prev) {
            if (slider.rgk.sizes.shift >= slider.rgk.sizes.slider) {
                if (slider.rgk.sizes.slide >= slider.rgk.sizes.slider) {
                    slider.rgk.sizes.shift -= slider.rgk.sizes.slider;
                } else {
                    slider.rgk.sizes.shift -= Math.floor(slider.rgk.sizes.slider/slider.rgk.sizes.slide)*slider.rgk.sizes.slide;
                }
            } else {
                slider.rgk.sizes.shift = 0;
            }
            direction = 'prev';
        } else if (next) {
            if (slider.rgk.sizes.rest >= slider.rgk.sizes.slider) {
                if (slider.rgk.sizes.slide >= slider.rgk.sizes.slider) {
                    slider.rgk.sizes.shift += slider.rgk.sizes.slider;
                } else {
                    slider.rgk.sizes.shift += Math.floor(slider.rgk.sizes.slider/slider.rgk.sizes.slide)*slider.rgk.sizes.slide;
                }
            } else {
                slider.rgk.sizes.shift += slider.rgk.sizes.rest;
            }
            direction = 'next';
        } else if (index > -1) {
            if (index * slider.rgk.sizes.slide >= slider.rgk.sizes.slides - slider.rgk.sizes.slider) {
                slider.rgk.sizes.shift += slider.rgk.sizes.rest;
            } else {
                slider.rgk.sizes.shift = index * slider.rgk.sizes.slide;
            }
            direction = (index > slider.rgk.position) ? 'next' : 'prev';
        }

        slider.rgk.sizes.rest = slider.rgk.sizes.slides - slider.rgk.sizes.slider - slider.rgk.sizes.shift;

        if (slider.dataset.orientation == 'vertical') {
            container.style.transform = 'translateY('+ -slider.rgk.sizes.shift +'px)';
        } else {
            container.style.transform = 'translateX('+ -slider.rgk.sizes.shift +'px)';
        }

        var controlPrev = slider.querySelector('[data-slide="prev"]'),
            controlNext = slider.querySelector('[data-slide="next"]');

        if (controlPrev) {
            controlPrev.classList.remove('is-disabled');
            if (slider.rgk.sizes.shift == 0) {
                controlPrev.classList.add('is-disabled');
            }
        }
        if (controlNext) {
            controlNext.classList.remove('is-disabled');
            if (slider.rgk.sizes.shift + slider.rgk.sizes.slider >= slider.rgk.sizes.slides) {
                controlNext.classList.add('is-disabled');
            }
        }

        slider.rgk.position = Math.round(slider.rgk.sizes.shift/slider.rgk.sizes.slide);

        var pager = slider.querySelector('[data-slide="page"]');

        if (pager) {

            var pages = pager.querySelectorAll('[data-slide]'),
                active = 0;

            pages.forEach(function(item) {
                item.classList.remove('is-active');
            });

            if (slider.rgk.sizes.shift + slider.rgk.sizes.slider == slider.rgk.sizes.slides) {
                active = pages.length - 1;
            } else if (slider.rgk.sizes.shift == 0) {
                active = 0;
            } else {
                for (var n = pages.length - 2; n > 0; n--) {
                    if (slider.rgk.position > pages[n-1].dataset.slide && slider.rgk.position <= pages[n].dataset.slide) {
                        active = n;
                        break;
                    }
                }
            }

            pages[active].classList.add('is-active');
            //pager.style.transform = 'translateX('+ -active*100 +'%)';

        }

        // trigger change event
        var evt = new CustomEvent('change.rgk.slider', {
            detail: {
                position: slider.rgk.position,
                previous: previous,
                direction: direction
            }
        });
        slider.dispatchEvent(evt);

    };

    var SliderBuild = function(el, target) {

        var slider = el;

        // if element not used by plugin
        if (!slider.rgk) {
            return;
        }

        slider.querySelector('.rgk-slider__slides').innerHTML = target;

        SliderUpdate(slider);

    };

    var SliderDestroy = function(el) {

        var slider = el;

        // if element already used by plugin
        if (slider.rgk) {

            // empty pager
            var pager = slider.querySelector('[data-slide="page"]');

            if (pager) {
                pager.innerHTML = '';
            }

            // disable nav buttons
            var controlPrev = slider.querySelector('[data-slide="prev"]'),
                controlNext = slider.querySelector('[data-slide="next"]');

            if (controlPrev) {
                controlPrev.classList.add('is-disabled');
            }
            if (controlNext) {
                controlNext.classList.add('is-disabled');
            }

            // reset slider shift
            var container = slider.querySelector('.rgk-slider__slides');

            container.style.transform = '';

            // remove element from window object
            var event = false;
            for (var i = 1; i < window.rgk.slider.length; i++) {
                if (window.rgk.slider[i] === slider) {
                    window.rgk.slider.splice(i, 1);
                    break;
                }
            }
            if (window.rgk.slider.length == 1) {
                event = window.rgk.slider[0];
                delete window.rgk.slider;
                if (Object.keys(window.rgk).length === 0) delete window.rgk;
            }

            // remove events listeners
            for (var evt in slider.rgk.events) {
                if (evt == 'resize' && event) {
                    //console.log('resize removed');
                    window.removeEventListener(evt, event);
                } else {
                    slider.removeEventListener(evt, slider.rgk.events[evt]);
                }
            }

            delete slider.rgk;

        }

    };

    var _SliderTouchTo = function(el, trigger) {

        var slider = el,
            container = slider.querySelector('.rgk-slider__slides'),
            offset = 0,
            style = '';

       if (trigger && trigger == 'reset') {
            offset =  slider.rgk.sizes.shift;
            container.classList.remove('is-swiping');
        } else {
            offset =  slider.rgk.sizes.shift + slider.rgk.touch.delta;
            container.classList.add('is-swiping');
        }

        container.style.transform = 'translateX('+ -offset +'px)';

    };

    var _ListenerTouchstart = function(e) {

        var slider = this;

        if (e.touches.length != 1 || slider.rgk.touch.started) return;

        slider.rgk.touch.detecting = true;
        slider.rgk.touch.duration = new Date().getTime();

        slider.rgk.touch.position[0] = {
            'touch': e.changedTouches[0],
            'x': e.changedTouches[0].pageX,
            'y': e.changedTouches[0].pageY
        };

    };

    var _ListenerTouchmove = function(e) {

        var slider = this,
            touchesArray = Array.from(e.changedTouches);

        if (!slider.rgk.touch.started && !slider.rgk.touch.detecting) return;

        slider.rgk.touch.position[1] = {
            'x': e.changedTouches[0].pageX,
            'y': e.changedTouches[0].pageY
        };

        if (slider.rgk.touch.detecting) detect();
        if (slider.rgk.touch.started) draw();

        function detect() {

            if (touchesArray.map(function(e) { return e.identifier; }).indexOf(slider.rgk.touch.position[0].touch.identifier) == -1) return;

            if (Math.abs(slider.rgk.touch.position[0].x - slider.rgk.touch.position[1].x) >= Math.abs(slider.rgk.touch.position[0].y - slider.rgk.touch.position[1].y)) {
                e.preventDefault();
                slider.rgk.touch.started = true;
            }

            slider.rgk.touch.detecting = false;

        }

        function draw() {

            e.preventDefault();

            if (touchesArray.map(function(e) { return e.identifier; }).indexOf(slider.rgk.touch.position[0].touch.identifier) == -1) return;

            slider.rgk.touch.delta = slider.rgk.touch.position[0].x - slider.rgk.touch.position[1].x;

            if (slider.rgk.touch.delta < 0 && (slider.rgk.sizes.shift == 0) || slider.rgk.touch.delta > 0 && (slider.rgk.sizes.shift + slider.rgk.sizes.slider == slider.rgk.sizes.slides)) {
                slider.rgk.touch.delta = slider.rgk.touch.delta / 5;
            }

            _SliderTouchTo(slider);

        }

    };

    var _ListenerTouchend = function(e) {

        var slider = this,
            touchesArray = Array.from(e.changedTouches);

        if (touchesArray.map(function(e) { return e.identifier; }).indexOf(slider.rgk.touch.position[0].touch.identifier) == -1 || !slider.rgk.touch.started) return;

        e.preventDefault();

        slider.rgk.touch.started = false;
        slider.rgk.touch.detecting = false;
        slider.rgk.touch.position = [];
        slider.rgk.touch.duration = new Date().getTime() - slider.rgk.touch.duration;

        if (Math.abs(slider.rgk.touch.delta / slider.rgk.touch.duration) < 0.5 && Math.abs(slider.rgk.touch.delta) < 160 || slider.rgk.touch.delta < 0 && (slider.rgk.sizes.shift == 0) || slider.rgk.touch.delta > 0 && (slider.rgk.sizes.shift + slider.rgk.sizes.slider == slider.rgk.sizes.slides)) {
            _SliderTouchTo(slider, 'reset');
        } else {
            slider.querySelector('.rgk-slider__slides').classList.remove('is-swiping');
            SliderMoveTo(slider, (slider.rgk.touch.delta < 0 ? 'prev' : 'next'));
        }

    };

    var _ListenerClick = function(e) {

        var slider = this,
            clicked = e.target;

        if (clicked.getAttribute('data-slide')) {

            e.preventDefault();
            var target = clicked.dataset.slide;

            SliderMoveTo(slider, target);

            return false;

        }

    };

    var _ListenerResize = function(e) {

        for (var i = 1; i < this.rgk.slider.length; i++) {
            SliderUpdate(this.rgk.slider[i]);
        }

    };



    var els = null;

    switch (typeof selector) {
        case 'string':
            els = document.querySelectorAll(selector);
            break;
        case 'object':
            selector.length ? els = selector : els = [selector];
            break;
    }

    if (els === null) {
        throw new TypeError('Element must not be null!');
    }

    for (var i = 0; i < els.length; i++) {

        el = els[i];

        switch (method) {
            case 'init':
                SliderAdd(el);
                break;
            case 'move':
                SliderMoveTo(el, target);
                break;
            case 'update':
                SliderUpdate(el);
                break;
            case 'build':
                SliderBuild(el, target);
                break;
            case 'destroy':
                SliderDestroy(el);
                break;
            default:
                SliderAdd(el);
                break;
        }

    }

}