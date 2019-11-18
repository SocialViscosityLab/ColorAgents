class DOM {

	static initialize = function () {
		// Buttons 
		DOM.buttons.run = document.getElementById("run");
		DOM.buttons.reset = document.getElementById("reset");
		DOM.buttons.trajectories_to_JSON = document.getElementById("trajectories_to_JSON");
		DOM.buttons.trajectories_to_JSON2 = document.getElementById("trajectories_to_JSON2");
		DOM.buttons.trajectories_to_CSV = document.getElementById("trajectories_to_CSV");
		DOM.buttons.cFactory = document.getElementById("cFactory");
		DOM.buttons.viscosities_to_JSON = document.getElementById("viscosities_to_JSON");
		DOM.buttons.globalViscosity_to_JSON = document.getElementById("globalViscosity_to_JSON");
		DOM.buttons.globalViscosity_to_CSV = document.getElementById("globalViscosity_to_CSV");

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
		DOM.checkboxes.showIndividualSeries = document.getElementById("showIndividualSeries");

		// Labels
		DOM.labels.agentsInWorld = document.getElementById("agentsInWorld");
		DOM.labels.humansInWorld = document.getElementById("humansInWorld");
		DOM.labels.nonhumansInWorld = document.getElementById("nonhumansInWorld");
		DOM.labels.sliderValue = document.getElementById('sliderValue');

		// sliders
		DOM.sliders.ticks = document.getElementById("ticks");
		DOM.sliders.tolerance = document.getElementById("changeMagnitude");
		DOM.sliders.range = document.getElementById("range");
	}

}
DOM.buttons = {};
DOM.checkboxes = {};
DOM.labels = {};
DOM.sliders = {}
DOM.lists = {}