import { select } from "../settings.js";

class Home {
    constructor(element) {
        const thisHome = this;

        thisHome.getElelements(element);
        thisHome.initCarousel();
    }

    getElelements(element) {
        const thisHome = this;

        thisHome.dom = {};
        thisHome.dom.wrapper = element;
        thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.home.carousel);
    }

    initCarousel() {
        const thisHome = this;

        const options = {
            "cellAlign": "center",
            "contain": true,
            "pageDots": true,
            "autoPlay": 3000,
            "wrapAround": true,
            "prevNextButtons": false
        }

        // eslint-disable-next-line no-undef
        new Flickity(thisHome.dom.carousel, options);
    }
}

export default Home