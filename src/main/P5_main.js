// Global P5 instances
var mainP5, vizMatrix, viscositySeries;

// The global variable world
var world;

// The global variable for metrics
var metrics;

var main = function (p5) {
	// Boolean variable to control the animation
	 let running;
	// This variable controls the simulation pace
	let simulationInterval;
	// This variable controls the metrics pace
	let metricsInterval;
	// timeInterval in milliseconds
	let interval = 100;
	// The visual elements representing agents from the world
	let vAgents = [];


	// ***** Setup ******
	p5.setup = function () {
		p5.createCanvas(500, 500);
		// Instantiate the world
		world = new World();

			// Animation starts on hold
	running = false;

		// set GUI elements
		DOM.initialize();

		DOM.buttons.run.onclick = runSimulation;
		DOM.buttons.reset.onclick = initialize;
		DOM.lists.cFactory.addEventListener('change', () => {
			initialize();
		})
		DOM.buttons.trajectories_to_JSON.onclick = trajectoriesToJSON;
		DOM.buttons.trajectories_to_JSON2.onclick = trajectoriesToJSON2;
		DOM.buttons.trajectories_to_CSV.onclick = trajectoriesToCSV;

		// Create an agent for each color
		initialize();
	}

	function initialize() {

		// Instantiate all the colors
		var cFactory = new ColorFactory(DOM.buttons.cFactory.value);

		// Retrieve al the colors
		var colors = cFactory.getAll();

		// clear agents
		world.reset();
		vAgents = [];

		// create instances
		for (var i = 0; i < colors.length; i++) {
			let x = Math.floor(Math.random() * p5.width);
			let y = Math.floor(Math.random() * p5.height);
			var agent = new Human(x, y, colors[i].name, colors[i].chroma, DOM.buttons.cFactory.value, 0, 100);

			//	agents.push(agent);
			world.subscribe(agent);

			//for each agent instantiate one vAgent
			vAgents.push(new VAgent(p5, agent));
		}
		let nObservers = world.observers.length;

		Utils.setStartTime();

		// setup metrics
		metrics = new Metrics(world);

		// Reset matrix visualizer
		try {
			vizMatrix.resetLastMatrix();
		} catch (error) {
			// error launched when vizMatrix is not hoisted.
		}

		//
		Utils.resetRecorder();

		DOM.labels.agentsInWorld.innerHTML = nObservers;
		DOM.labels.humansInWorld.innerHTML = world.getHumans().length;
		DOM.labels.nonhumansInWorld.innerHTML = world.getNonhumans().length;
	}

	// ***** DRAW ******
	p5.draw = function () {
		p5.background(250, 250, 250);

		// go over all the agents
		for (var a = 0; a < vAgents.length; a++) {

			//show agent
			if (DOM.checkboxes.showAgents.checked) {
				vAgents[a].show();
			}

			// show network
			if (DOM.checkboxes.showInteractions.checked) {
				vAgents[a].visualizeInteractions();
			}

			//
			if (DOM.checkboxes.showPerceptionField.checked) {
				vAgents[a].showPerceptionField();
			}

			// animate agents
			if (DOM.checkboxes.showTrajectories.checked) {
				vAgents[a].showTrajectory();
			}
		}
	}



	//Function controlled by guy element that enables or disables the animation
	function runSimulation() {

		if (DOM.lists.rule.value != '') {
			running = !running;
			if (running) {

				// the interval controlling how often the world updtaes itself. Units in milliseconds
				let iterations = Infinity;
				simulationInterval = setInterval(() => { world.runAgents(iterations) }, interval);

				// calculate metrics
				metricsInterval = setInterval(() => {
					metrics.getMetricsData(),
					vizMatrix.setLastMatrix(world.getTicks())
				},
					interval);
			} else {
				clearInterval(simulationInterval);
				clearInterval(metricsInterval);
			}

			// Update DOM element content
			if (running) {
				DOM.buttons.run.innerHTML = "Running";
				DOM.buttons.run.style.backgroundColor = "rgb(240, 162, 186)";
			} else {
				DOM.buttons.run.innerHTML = "On hold";
				DOM.buttons.run.style.backgroundColor = "rgb(162, 209, 162)";
			}
		} else {
			alert('Choose interaction rule first');
		}
	}

	// function sAgents() {
	// 	showAgents = !showAgents;
	// }

	// function sTrajectories() {
	// 	showTrajectories = !showTrajectories;
	// }

	// function sInteractions() {
	// 	showInteractions = !showInteractions;
	// }

	// function sPerField() {
	// 	showPerField = !showPerField;
	// }

	function trajectoriesToJSON() {
		let file = []
		world.getAgents().forEach((agent) => {
			file.push({ agent: agent.id, locations: agent.locations })
		})
		p5.saveJSON(file, 'trajectories.json');
	}

	function trajectoriesToJSON2() {
		p5.saveJSON(Utils.getRecording(), 'trajectoriesV2.json', true);
	}

	function trajectoriesToCSV() {
		p5.save(Utils.getRecording(), 'trajectoriesCSV.csv');
		console.log("Trajectories CSV File saved");
	}

	p5.updateSliderValue = function (sliderName, value) {
		document.getElementById(sliderName).innerHTML = value;
	}
}

var mainP5 = new p5(main, "ColorAgents");
