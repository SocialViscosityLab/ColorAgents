// Runs on a local server. For instruccions see: https://github.com/processing/p5.js/wiki/Local-server

var colorAgents = function(p5){


	var agents = [];

	p5.setup = function(){
		p5.createCanvas(960,500);

		var rainbow = new ColorFactory();
		var colors = rainbow.getNona();

		for(var i=0; i< colors.length; i++){
			var a = new AgentColor(p5, i, colors[i]);
			agents.push(a);
		}

		for (var i = 0; i< agents.length ; i++) {
			agents[i].nearToFarther(p5,agents);
		}

		// Initial color
		myColor = p5.color(255);

	}

	p5.draw = function (){
		//p5.background(255,125,0);
		p5.background(255,255,255);
		for (var a = 0; a< agents.length; a++){
			//agents[a].run(p5,agents);
			agents[a].show(p5);
			agents[a].visualizeInteractions(p5, agents);
			agents[a].move(p5);
		}
	}
}

var instance1 = new p5(colorAgents, "ColorAgents");

