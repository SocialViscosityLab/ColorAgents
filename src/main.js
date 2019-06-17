// The global variable world
var world;

// The metrics
var metrics;

var colorAgents = function(p5){
	// Boolean variable to control the animation
	let running;
	// Booleans for buttons
	let showAgents, showTrajectory, showInteractions, showPerField;
	// This variable controls the simulation pace
	let simulationInterval;
	// This variable controls the metrics pace
	let metricsInterval;
	// timeInterval in milliseconds
	let interval = 100;
	// The visual elements representing agents from the world
	let vAgents = [];


	// ***** Setup ******
	p5.setup = function(){
		p5.createCanvas(500,500);

		// Instantiate the world
		world = new World();

		// set GUI buttons
		showAgents = true;
		showTrajectories = false;
		showInteractions = true;
		showPerField = true;

		// Animation starts on hold
		running = false;

		// Create an agent for each color
		initialize();

		// GUI Elements
		document.getElementById("run").onclick = runSimulation;
		document.getElementById("showAgents").onclick = sAgents;
		document.getElementById("showTrajectories").onclick = sTrajectories;
		document.getElementById("showInteractions").onclick = sInteractions;
		document.getElementById("showPerceptionField").onclick = sPerField;
		document.getElementById("reset").onclick = initialize;
		document.getElementById("cFactory").addEventListener('change', ()=>{
			initialize();
		})
	}

	function initialize(){
		// Instantiate all the colors
		var cFactory = new ColorFactory(document.getElementById("cFactory").value);

		// Retrieve al the colors
		var colors = cFactory.getAll();

		// clear agents
		world.reset();
		vAgents = [];

		// create instances
		for(var i=0; i< colors.length; i++){
			let x = Math.floor(Math.random() * p5.width);
			let y = Math.floor(Math.random() * p5.height);
			var agent = new Human(x, y, colors[i].name, colors[i].chroma, document.getElementById("cFactory").value,document.getElementById("sensibility").value, 20, 100);

			//	agents.push(agent);
			world.subscribe(agent);

			//for each agent instantiate one vAgent
			vAgents.push(new VAgent(p5,agent));
		}
		let nObservers = world.observers.length;

		Utils.setStartTime();

		// setup metrics
		metrics = new Metrics(world);

		// Reset matrix visualizer
		vizMatrix1D = new VisualInteractionMatrix(p5, world, world.getAgents()[4]);

		document.getElementById("agentsInWorld").innerHTML = nObservers;
		document.getElementById("humansInWorld").innerHTML = world.getHumans().length;
		document.getElementById("nonhumansInWorld").innerHTML = world.getNonhumans().length;
	}

	// ***** DRAW ******
	p5.draw = function (){
		p5.background(255,255,255);

		// go over all the agents
		for (var a = 0; a < vAgents.length; a++){

			//show agent
			if (showAgents){
				vAgents[a].show();
			}

			// show network
			if (showInteractions){
				vAgents[a].visualizeInteractions();
			}

			//
			if (showPerField){
				vAgents[a].showPerceptionField();
			}

			// animate agents
			if (showTrajectories){
				vAgents[a].showTrajectory();
			}
		}
	}

	//Function controlled by guy element that enables or disables the animation
	function runSimulation(){
		if (document.getElementById("rule").value != ''){
			running = !running;
			if (running){

				// the interval controlling how often the world updtaes itself. Units in milliseconds
				simulationInterval = setInterval(() => {world.runAgents()}, interval);

				// calculate metrics
				metricsInterval = setInterval(() => {metrics.getMetricsData()}, interval);
			} else {
				clearInterval(simulationInterval);
				clearInterval(metricsInterval);
			}

			// Update DOM element content
			if (running){
				document.getElementById("run").innerHTML = "Running";
			} else {
				document.getElementById("run").innerHTML = "On hold";
			}
		}else{
			alert('Choose interaction rule first');
		}
	}

	function sAgents(){
		showAgents = !showAgents;
	}

	function sTrajectories(){
		showTrajectories = !showTrajectories;
	}

	function sInteractions(){
		showInteractions = !showInteractions;
	}

	function sPerField(){
		showPerField = !showPerField;
	}
}

var globalP5 = new p5(colorAgents, "ColorAgents");


/// SECOND P5 INSTANCE
var plotMatrix = function (p5){

	let vizMatrix1D;
	let showIntMtrx = true;

	p5.setup = function(){
		p5.createCanvas(500,500);
		initialize();
		document.getElementById("reset").addEventListener('click', () =>{initialize();})
		document.getElementById("showMatrix").onclick = sIntMtrx;
		document.getElementById("cFactory").addEventListener('change', ()=>{
			initialize();
		})
	}

	function sIntMtrx(){
		showIntMtrx = !showIntMtrx;
	}

	function initialize(){
		// Reset matrix visualizer
		vizMatrix1D = new VisualInteractionMatrix(p5, world);
	}

	p5.draw = function(){
		p5.background(255);

		// MATRICES
		if (showIntMtrx && world.getTics() >=1){
			vizMatrix1D.plot2(p5.createVector(0,30), metrics.getMatrixAt(world.getTics()));
		}
	}
}

var vizMatrix = new p5(plotMatrix, "PlotMatrix");



/// THIRD P5 INSTANCE
var timeSeries = function (p5){

	let series;
	let showSeries = true;

	p5.setup = function(){
		p5.createCanvas(500,500);
		series = new Chart(this, p5.createVector(50,250), 400, 200, 1, 1 );
		// GUI Elements
		document.getElementById("showSeries").onclick = showSeries;
	}

	showSeries = function(){
		showSeries = !showSeries;
	}

	p5.draw = function(){
		p5.background(255);

		if (showSeries){
			//go over all the keys of metrics.viscosityData
			metrics.agentsViscosityData.forEach((value, agent)=>{
				//	series.geomPoint(value, agent.id, agent.colorValues.rgb());
				series.geomPath(value, "", agent.colorValues.rgb());

			})
			series.geomPath(metrics.globalViscosityData,"global",[0,0,0])
			series.canvas();
		}
	}
}

var viscositySeries = new p5(timeSeries, "TimeSeries");
