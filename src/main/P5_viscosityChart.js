var viscosityChart = function (p5){
  // The chart object
  let series;

  p5.setup = function(){
    p5.createCanvas(500,300);
    series = new Chart(this, p5.createVector(30,270), 400, 250, 1, "Inverse viscosity", 0, 1 );
    // GUI Elements
    DOM.buttons.viscosities_to_JSON.onclick = viscositiesToJSON;
    DOM.buttons.globalViscosity_to_JSON.onclick = globalViscosityToJSON;
    DOM.buttons.globalViscosity_to_CSV.onclick = globalViscosityToCSV;
  }

  showIndividualSeries = function(){
    showIndividualSeries = !showIndividualSeries;
  }

  p5.draw = function(){
    p5.background(255);
    world.permuLoaded.then(a =>{
      if (DOM.checkboxes.showIndividualSeries.checked){
        //go over all the keys of metrics.viscosityData
        metrics.agentsViscosityData.forEach((value, agent)=>{
          series.geomPath(value, "", agent.colorValues.rgb());
        })
      }

      if (DOM.checkboxes.showSeries.checked){
        series.geomPath(metrics.globalViscosityData,"global",[0,0,0]);
      }

      // Plot the chart canvas
      series.canvas();

      // Set the max value of tickSlider
      DOM.sliders.ticks.max = series.xAxis.value;

      series.geomVLine(DOM.sliders.ticks.value);

      series.geomTextValueAtKey(metrics.globalViscosityData, Number(DOM.sliders.ticks.value));
    })
  }

  // Exports all the agent's viscosities to JSON. The file is saved in user's download folder
  function viscositiesToJSON(){
    let file = []
    // first iterator
    let itr1 = metrics.agentsViscosityData.entries();
    let item1 = itr1.next();
    while(!item1.done){
      // second iterator
      let itr2 = item1.value[1].entries();
      let item2 = itr2.next();
      let tempArray = [];
      while (!item2.done) {
        tempArray.push(item2.value);
        item2 = itr2.next();
      }
      file.push({agent:item1.value[0].id, viscosities:tempArray});
      item1 = itr1.next();
    }
    p5.saveJSON(file, 'viscosities.json');
  }

  // Exports global viscosity to JSON. The file is saved in user's download folder
  function globalViscosityToJSON(){
    let file = [];
    // first iterator
    let itr = metrics.globalViscosityData.entries();
    let item = itr.next();
    while(!item.done){
      file.push({tick:item.value[0], viscosity:item.value[1]});
      item = itr.next();
    }
    p5.saveJSON(file, 'globalViscosity.json');
  }

    // Exports global viscosity to CSV. The file is saved in user's download folder
    function globalViscosityToCSV(){
      let file = [];
      // first iterator
      let itr = metrics.globalViscosityData.entries();
      let item = itr.next();
      while(!item.done){
        file.push([item.value[0],item.value[1]]);
        item = itr.next();
      }
      p5.save(file, 'globalViscosityCSV.csv');
      console.log("Viscosity CSV file saved");
    }
}

viscositySeries = new p5(viscosityChart, "TimeSeries");
