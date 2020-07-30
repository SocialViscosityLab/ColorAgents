var heatMap = function (p5){

  let vizMatrixCanvas;
  //let showIntlastMatrix = true;
  let lastMatrix;
  let lastMatrixTick = -1;

  p5.setup = function(){
    p5.createCanvas(350,350);
    tickSlider = DOM.sliders.ticks;
    initialize();
    DOM.buttons.reset.addEventListener('click', () =>{
      initialize();
    })
    //DOM.checkboxes.showMatrix.onclick = sIntlastMatrix;
    DOM.lists.cFactory.addEventListener('change', ()=>{
        initialize();
    });
    DOM.buttons.interactionMatrix_to_JSON.onclick = interactionMatrixToJSON;
    DOM.buttons.interactionMatrix_to_CSV.onclick = interactionMatrixToCSV;

  }

  initialize = function(){
    // Reset matrix visualizer
    world.permuLoaded.then(a =>{
      vizMatrixCanvas = new InteractionMatrixCanvas(p5, world);
    });
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
    world.permuLoaded.then(a =>{
      // MATRICES
      if (DOM.checkboxes.showMatrix.checked && lastMatrix != undefined){
        vizMatrixCanvas.plot2(p5.createVector(25,30), lastMatrix);
      }
    })
  }
  
  // Exports global viscosity to CSV. The file is saved in user's download folder
  function interactionMatrixToJSON(){
    let ticks = [];
    for (let i = 0; i < world.getTicks(); i++) {

     tempMatrix = metrics.getMatrixAt(i);
     let tempPairs = [ ]
     tempMatrix.forEach(a => {
       a.interactions.forEach(p => {
         let tempPair = [a.id, p.interactant];
         if(!pairInArray(tempPair,tempPairs)){
          tempPair.push(p.currentDist);
          tempPairs.push(tempPair);
         }
       });
       
     });
     ticks.push({'id': i, 'interactions': tempPairs});
    }
    let file = {'ticks': ticks}
    p5.save(file, 'matrix.json');
    console.log("Matrix JSON file saved");
    
  }

  // Exports global viscosity to CSV. The file is saved in user's download folder
  function interactionMatrixToCSV(){
    let file = [];
    for (let i = 0; i < world.getTicks(); i++) {
     tempMatrix = metrics.getMatrixAt(i);
     let tempPairs = []
     let tempRow = [i]
     tempMatrix.forEach(a => {
       a.interactions.forEach(p => {
         let tempPair = [a.id, p.interactant];
         if(!pairInArray(tempPair, tempPairs)){
          tempPair.push(p.currentDist);
          tempPairs.push(tempRow.concat(tempPair));
          file.push(tempRow.concat(tempPair));
         }
       });
     });
    }
    p5.save(file, 'matrixCSV.csv');
    console.log("Matrix CSV file saved");
    }


  
  function pairInArray(pairA, pairs){
    isInArray = false;
    if(Object.keys(pairs).length != 0){

      pairs.forEach(pairB => {
        if(pairB.includes(pairA[0]) && pairB.includes(pairA[1])){
          isInArray = true
        }
      });
    }

    return isInArray
  }
}

vizMatrix = new p5(heatMap, "PlotMatrix");
