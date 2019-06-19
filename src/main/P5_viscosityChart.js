var viscosityChart = function (p5){

	let series;
	let showSeries = true;
	let showIndividualSeries;

	p5.setup = function(){
		p5.createCanvas(500,300);
		series = new Chart(this, p5.createVector(30,270), 400, 250, 1, 1 );
		// GUI Elements
		document.getElementById("showSeries").onclick = showSeries;
		document.getElementById("showIndividualSeries").onclick = showIndividualSeries;
		showIndividualSeries = false;
	}

	showSeries = function(){
		showSeries = !showSeries;
	}

	showIndividualSeries = function(){
		showIndividualSeries = !showIndividualSeries;
	}

	p5.draw = function(){
		p5.background(255);

		if (showIndividualSeries){
			//go over all the keys of metrics.viscosityData
			metrics.agentsViscosityData.forEach((value, agent)=>{
				series.geomPath(value, "", agent.colorValues.rgb());
			})
		}

		if (showSeries){
			series.geomPath(metrics.globalViscosityData,"global",[0,0,0])
		}
		series.canvas();
	}
}

var viscositySeries = new p5(viscosityChart, "TimeSeries");
