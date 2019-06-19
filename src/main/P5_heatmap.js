var heatMap = function (p5){

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
		if (showIntMtrx){
			vizMatrix1D.plot2(p5.createVector(10,30), metrics.getMatrixAt(world.getTics()));
		}
	}
}

var vizMatrix = new p5(heatMap, "PlotMatrix");
