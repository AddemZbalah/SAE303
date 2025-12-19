import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class RadarChartView {
    constructor() {
        this.root = htmlToDOM(template);
    }

    html() {
        return template;
    }

    dom() {
        return this.root;
    }

    getPolygon() {
        return this.root.querySelector('#radar-data-poly');
    }

    getContainer() {
        return this.root;
    }

    getCloseButton() {
        return this.root.querySelector('#radar-close');
    }

    getGrid() {
        return this.root.querySelector('.radar-grid');
    }

    getAxes() {
        return this.root.querySelector('.radar-axes');
    }

    getMarkers() {
        return this.root.querySelector('.radar-markers');
    }
}

export { RadarChartView };
