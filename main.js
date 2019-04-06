// Runs on a local server. For instruccions see: https://github.com/processing/p5.js/wiki/Local-server
/**
* Main class
*/
var colorAgents = function(p5){

	// The world
	var world;
	// Boolean variable to control the animation
	var running;
	// Booleans for buttons
	let showAgents, showTrajectory, showInteractions, showPerField;
	let intervalInstance;

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
	}

	function initialize(){
		// Instantiate all the colors
		var cFactory = new ColorFactory('munsell');
		// Retrieve al the colors
		var colors = cFactory.getAll();
		// clear agents
		world.reset();
		// create instances
		for(var i=0; i< colors.length; i++){
			let x = Math.floor(Math.random() * p5.width);
			let y = Math.floor(Math.random() * p5.height);
			var a = new Human(x, y, colors[i].name, colors[i].chroma, 'munsell','linear', 20, 100);
		//	agents.push(a);
			world.subscribe(a);
		}
		let nObservers = world.observers.length;

		document.getElementById("agentsInWorld").innerHTML = nObservers;
		document.getElementById("humansInWorld").innerHTML = world.getHumans().length;
		document.getElementById("nonhumansInWorld").innerHTML = world.getNonhumans().length;
	}

	// ***** DRAW ******
	p5.draw = function (){
		p5.background(255,255,255);
		let agents = world.getAgents();
		// go over all the agents
		for (var a = 0; a< agents.length; a++){
			//show agent
			if (showAgents){
				agents[a].show(p5);
			}
			// show network
			if (showInteractions){
				agents[a].visualizeInteractions(p5);
			}
			//
			if (showPerField){
				agents[a].showPerceptionField(p5);
			}
			// animate agents
			if (showTrajectories){
				agents[a].showTrajectory(p5);
			}
		}
	}

	/**
	* Function controlled by guy element that enables or disables the animation
	*/
	function runSimulation(){
		if (document.getElementById("rule").value != ''){
			running = !running;
			if (running){
				// the interval controlling how often the world updtaes itself. Units in milliseconds
				intervalInstance = setInterval(() => {world.runAgents()}, 100);
			} else {
				clearInterval(intervalInstance);
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
