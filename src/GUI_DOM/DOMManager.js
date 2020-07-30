/**
 * This static class manages all the GUI elements displayed in the browser and serves as an interface between the DOM and the JavaScript code.
*/

class DOM {
    // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
    constructor() {}

    /** Initializes all the GUI elements ceated in the DOM
     */
    static initialize = function() {
        // Buttons 
        DOM.buttons.run = document.getElementById("run");
        DOM.buttons.reset = document.getElementById("reset");
        DOM.buttons.runSweep = document.getElementById("runSweep")
        DOM.buttons.resetSweep = document.getElementById("resetSweep")
        DOM.buttons.trajectories_to_JSON = document.getElementById("trajectories_to_JSON");
        DOM.buttons.trajectories_to_JSON2 = document.getElementById("trajectories_to_JSON2");
        DOM.buttons.trajectories_to_CSV = document.getElementById("trajectories_to_CSV");
        DOM.buttons.viscosities_to_JSON = document.getElementById("viscosities_to_JSON");
        DOM.buttons.globalViscosity_to_JSON = document.getElementById("globalViscosity_to_JSON");
        DOM.buttons.globalViscosity_to_CSV = document.getElementById("globalViscosity_to_CSV");
        DOM.buttons.modelsQuality_to_JSON = document.getElementById("modelsQuality_to_JSON");
        DOM.buttons.globalModelQuality_to_JSON = document.getElementById("globalModelQuality_to_JSON");
        DOM.buttons.globalModelQuality_to_CSV = document.getElementById("globalModelQuality_to_CSV");
        DOM.buttons.interactionMatrix_to_JSON = document.getElementById("interactionMatrix_to_JSON");
        DOM.buttons.interactionMatrix_to_CSV = document.getElementById("interactionMatrix_to_CSV");
        

        // Lists
        DOM.lists.cFactory = document.getElementById("cFactory");
        DOM.lists.rule = document.getElementById("rule");
        DOM.lists.sensibility = document.getElementById('sensibility');

        // Checkboxes
        DOM.checkboxes.showAgents = document.getElementById("showAgents");
        DOM.checkboxes.showTrajectories = document.getElementById("showTrajectories");
        DOM.checkboxes.showInteractions = document.getElementById("showInteractions");
        DOM.checkboxes.showPerceptionField = document.getElementById("showPerceptionField");
        DOM.checkboxes.showMatrix = document.getElementById("showMatrix");
        DOM.checkboxes.showSeries = document.getElementById("showSeries");
        DOM.checkboxes.showGeneralModel = document.getElementById("showGeneralModel");
        DOM.checkboxes.showIndividualModels = document.getElementById("showIndividualModels");
        DOM.checkboxes.showIndividualSeries = document.getElementById("showIndividualSeries");
        DOM.checkboxes.sweepCFactory = document.getElementById("includeCFactory");
        DOM.checkboxes.sweepRule = document.getElementById("includeRules");
        DOM.checkboxes.sweepRange = document.getElementById("includeRange");
        DOM.checkboxes.sweepSensibility = document.getElementById("includeSensibility");
        DOM.checkboxes.sweepTolerance = document.getElementById("includeTolerance");
        DOM.checkboxes.sweepLRates = document.getElementById("includeLRates");
        DOM.checkboxes.sweepDecreasing = document.getElementById("includeDecreasing");
        DOM.checkboxes.sweepExploration = document.getElementById("includeExploration");
        DOM.checkboxes.sweepDuration = document.getElementById("durationLimit");
        DOM.checkboxes.setDecreas = document.getElementById("setDecreas");
        DOM.checkboxes.setExploration = document.getElementById("setExploration");

        // Labels
        DOM.labels.agentsInWorld = document.getElementById("agentsInWorld");
        DOM.labels.humansInWorld = document.getElementById("humansInWorld");
        DOM.labels.nonhumansInWorld = document.getElementById("nonhumansInWorld");
        DOM.labels.learningAgent = document.getElementById("learningAgent");
        DOM.labels.ticksInWorld = document.getElementById("ticksInWorld");
        DOM.labels.sliderValue = document.getElementById('sliderValue');


        // sliders
        DOM.sliders.ticks = document.getElementById("ticks");
        DOM.sliders.tolerance = document.getElementById("changeMagnitude");
        DOM.sliders.range = document.getElementById("range");
        DOM.sliders.runs = document.getElementById("runs");
        DOM.sliders.tickLength = document.getElementById("tickLength");
        DOM.sliders.duration = document.getElementById("duration");
        DOM.sliders.news = document.getElementById("news");
        DOM.sliders.rate = document.getElementById("rate");
        DOM.sliders.decreasing = document.getElementById("decreasing");
        DOM.sliders.exploration = document.getElementById("exploration");

    }

    /** Updates a slider's label 
     * @param {string} sliderName
     * @param {number} value
     */
    static updateSliderValue = function(sliderName, value) {
        document.getElementById(sliderName).innerHTML = value;
    }

    /** Retrieves the list of HTML options from a given list
     * @param {string} listKey The name of the list whose options will be retrieved
     * @return {Array} The collection of options
     */
    static getListOptions = function(listKey) {
        let rtn = []
        for (let [key, value] of Object.entries(DOM.lists)) {
            if (key === listKey) {
                for (let i = 0; i < value.length; i++) {
                    rtn.push(value.item(i).value);
                }
            }
        }
        return rtn;
    }

    /** Retrieves the value of all possible parameters for a slider. It creates an array with
     * all the values, starting from the min slider value up to the max slider value,
     * increasing in slider predefined steps.
     * @param {string} sliderKey The name of the slider whose parameters will be retrieved
     * @return {Array} The collection of values
     */
    static getSliderParams = function(sliderKey) {
        for (let [key, value] of Object.entries(DOM.sliders)) {
            if (key === sliderKey) {
                let tmp = [];
                let min = Number(value.min)
                let max = Number(value.max)
                let step = Number(value.step)
                for (let i = min; i <= max; i += step) {
                    tmp.push(i)
                }
                return tmp;
            }
        }
    }

    /** Creates an object with the sweep parameters as defined by the user on the GUI */
    static getSweepParams() {
        let param = {}
        if (DOM.checkboxes.sweepCFactory.checked) {
            param.cFactory = this.getListOptions('cFactory')
        } else {
            param.cFactory = [DOM.lists.cFactory.value]
        }
        if (DOM.checkboxes.sweepRule.checked) {
            param.rule = this.getListOptions('rule')
        } else {
            param.rule = [DOM.lists.rule.value]
        }
        if (DOM.checkboxes.sweepRange.checked) {
            param.range = this.getSliderParams('range')
        } else {
            param.range = [DOM.sliders.range.value]
        }
        if (DOM.checkboxes.sweepSensibility.checked) {
            param.sensibility = this.getListOptions('sensibility')
        } else {
            param.sensibility = [DOM.lists.sensibility.value]
        }
        if (DOM.checkboxes.sweepTolerance.checked) {
            param.tolerance = this.getSliderParams('tolerance')
        } else {
            param.tolerance = [DOM.sliders.tolerance.value]
        }
        // learning paramethers
        if (DOM.checkboxes.sweepLRates.checked) {
            param.rate = this.getSliderParams('rate')
        } else {
            param.rate = [DOM.sliders.rate.value]
        }
        if (DOM.checkboxes.sweepDecreasing.checked) {
            param.decreasing = this.getSliderParams('decreasing')
        } else {
            param.decreasing = [DOM.sliders.decreasing.value]
        }
        if (DOM.checkboxes.sweepExploration.checked) {
            param.exploration = this.getSliderParams('exploration')
        } else {
            param.exploration = [DOM.sliders.decreasing.value]
        }
        
        param.runs = DOM.sliders.runs.value;
        return param;
    }
}


DOM.buttons = {};
DOM.checkboxes = {};
DOM.labels = {};
DOM.sliders = {}
DOM.lists = {}