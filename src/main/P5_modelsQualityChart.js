var qualityChart = function (p5){
  // The chart object
  let series;

  p5.setup = function(){
    p5.createCanvas(500,300);
    series = new Chart(this, p5.createVector(30,270), 400, 250, 1, "Model quality", -0.1,0.1 );
    // GUI Elements
    DOM.buttons.modelsQuality_to_JSON.onclick = modelsQualityToJSON;
    DOM.buttons.globalModelQuality_to_JSON.onclick = globalModelQualityToJSON;
    DOM.buttons.globalModelQuality_to_CSV.onclick = globalModelQualityToCSV;
  }

  showIndividualSeries = function(){
    showIndividualSeries = !showIndividualSeries;
  }

  p5.draw = function(){
    p5.background(255);

    if (DOM.checkboxes.showIndividualModels.checked){
      //go over all the keys of metrics.viscosityData
      metrics.agentsQualityData.forEach((value, agent)=>{
        series.geomPath(value, "", agent.colorValues.rgb());
      })
    }

    if ( DOM.checkboxes.showGeneralModel .checked){
      //go over all the keys of metrics.viscosityData
      series.geomPath(metrics.globalQualityData,"global",[0,0,0]);
    }

    // Plot the chart canvas
    series.canvas();

     series.geomVLine(DOM.sliders.ticks.value);
     series.geomTextValueAtKey(metrics.globalQualityData, Number(DOM.sliders.ticks.value));
  }

  // Exports all the agent's viscosities to JSON. The file is saved in user's download folder
  function modelsQualityToJSON(){
    let file = []
    // first iterator
    let itr1 = metrics.agentsQualityData.entries();
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
      file.push({agent:item1.value[0].id, models_quality:tempArray});
      item1 = itr1.next();
    }
    p5.saveJSON(file, 'models_quality.json');
  }

  // Exports global viscosity to JSON. The file is saved in user's download folder
  function globalModelQualityToJSON(){
    let file = [];
    // first iterator
    let itr = metrics.globalQualityData.entries();
    let item = itr.next();
    while(!item.done){
      file.push({tick:item.value[0], quality:item.value[1]});
      item = itr.next();
    }
    p5.saveJSON(file, 'globalQuality.json');
  }

    // Exports global viscosity to CSV. The file is saved in user's download folder
    function globalModelQualityToCSV(){
      let file = [];
      // first iterator
      let itr = metrics.globalQualityData.entries();
      let item = itr.next();
      while(!item.done){
        file.push([item.value[0],item.value[1]]);
        item = itr.next();
      }
      p5.save(file, 'globalQualityCSV.csv');
      console.log("Viscosity CSV file saved");
    }
}

qualitySeries = new p5(qualityChart, "QualityChart");
