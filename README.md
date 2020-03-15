# rgk-slider

![Version](https://img.shields.io/badge/version-v1.6-orange.svg)
![Test](https://img.shields.io/badge/test-passing-green)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)

rgkSlider is simple and fast script for creating sliders with touch events support.

### Getting Started

Base HTML layout:
```html
<div id="sliderSimple" class="rgk-slider" data-ride="slider">
     <div class="rgk-slider__container">
          <div class="rgk-slider__slides">
               <div class="rgk-slider__slide" data-title="Slide title (optional)">
                    Your slide content here
               </div>
          </div>
     </div>
     <button data-slide="prev" class="rgk-slider__control rgk-slider__control--prev" title="Prev slide" type="button">Prev slide (optional)</button>
     <button data-slide="next" class="rgk-slider__control rgk-slider__control--next" title="Next slide" type="button">Next slide (optional)</button>
     <div data-slide="page" class="rgk-slider__pager">(optional)</div>
</div>
```
Initialization:
```javascript
rgkSelect('#sliderSimple');
```

### Documentation

For more information and examples of use, see [Documentation page](https://irgik.github.io/rgk-slider/)