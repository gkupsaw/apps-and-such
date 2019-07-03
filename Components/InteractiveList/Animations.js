const appear = (compliment, options) => {
    // console.log('growing');
    let opacity = parseFloat(window.getComputedStyle(compliment).getPropertyValue('opacity'));
    const id = setInterval(frame, 10);
    function frame () {
        if (opacity >= 1) {
            compliment.style.opacity = 1;
            if (options !== undefined && options.grow) grow(compliment);
            clearInterval(id);
        } else {
            opacity += 0.1;
            compliment.style.opacity = opacity;
        }
    }
}

const disappear = (compliment, options) => {
    // console.log('disappearing');
    let opacity = parseFloat(window.getComputedStyle(compliment).getPropertyValue('opacity'));
    const id = setInterval(frame, 10);
    function frame () {
        if (opacity <= 0) {
            clearInterval(id);
        } else {
            opacity -= 0.05;
            compliment.style.opacity = opacity;
        }
    }
}

const animate = (animation, element, options) => {  //here, options just specifies whether the appear animation includes growth 
                                                    //popups appear and grow, but items just appear
    const compliment = document.getElementById(element);
    switch (animation)   {
        case 'item_appear':
            appear(compliment, options);
            break;
        case 'item_disappear':
            disappear(compliment, options);
            break;
        case 'none':
            console.log('No animation specified.')
            break;
        default:
            console.log('Invalid animation. Try one of the following: appear, disappear, grow, shrink');
    }
}

module.exports = {

    animate,
    appear,
    disappear,

}