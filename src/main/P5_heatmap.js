var heatMap = function (p5){

  let vizMatrixCanvas;
  //let showIntlastMatrix = true;
  let lastMatrix;
  let lastMatrixTick = -1;

  p5.setup = function(){
    p5.createCanvas(350,350);
    tickSlider = DOM.sliders.ticks;
    initialize();
    DOM.buttons.reset.addEventListener('click', () =>{initialize();})
    //DOM.checkboxes.showMatrix.onclick = sIntlastMatrix;
    DOM.lists.cFactory.addEventListener('change', ()=>{
      initialize();
    })
  }

  // sIntlastMatrix = function(){
  //   showIntlastMatrix = !showIntlastMatrix;
  // }

  initialize = function(){
    // Reset matrix visualizer
    vizMatrixCanvas = new InteractionMatrixCanvas(p5, world);
  }

  p5.setLastMatrix = function(time){
    if (time != lastMatrixTick){
      lastMatrix = metrics.getMatrixAt(time);
      lastMatrixTick = time;
    }
  }

  p5.resetLastMatrix = function(){
    lastMatrix = undefined;
  }

  p5.draw = function(){
    p5.background(250);

    // MATRICES
    if (DOM.checkboxes.showMatrix.checked && lastMatrix != undefined){
      vizMatrixCanvas.plot2(p5.createVector(25,30), lastMatrix);
    }
  }
}

vizMatrix = new p5(heatMap, "PlotMatrix");
