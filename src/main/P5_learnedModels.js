var learnedModels = function (p5) {

  let lastModel;
  let lastModelTick = -1;
  let learningAgents;

  p5.setup = function () {
    p5.createCanvas(350, 350);
    tickSlider = DOM.sliders.ticks;
    loadAgents();
    DOM.buttons.reset.addEventListener('click', () => { loadAgents(); })
    DOM.lists.cFactory.addEventListener('change', () => {
      loadAgents();
    });
    DOM.sliders.news.addEventListener('change', () => {
      loadAgents();
    });
  }

  loadAgents = function () {
    world.permuLoaded.then( a =>{
      learningAgents = world.getLearningAgents();
    })
  }

  p5.setLastModels = function (time) {
    if (time != lastModelTick) {
      lastModel = metrics.getModelsAt(time);
      lastModelTick = time;
    }
  }

  p5.resetLastModel = function () {
    lastModel = undefined;
  }

  p5.draw = function () {
    p5.background(250);
    p5.noStroke();
    world.permuLoaded.then( x =>{
      let arraySize = learningAgents.length;
      let margin = 25;
      let fontSize = 20;
      let modelHight = (p5.height - (margin * 2) - (margin * arraySize / 4)) / arraySize;
      let count = 0;

        learningAgents.forEach(learningAgent => {
          if (lastModel != undefined ){
            if(lastModel.length > 0){
              let register = lastModel.find(r =>{return r.id == learningAgent.id});
              drawModel(register.model, learningAgent, count, fontSize, margin, modelHight);
            }else{
              drawModel(learningAgent.cMentalModel, learningAgent, count, fontSize, margin, modelHight);
            }
        }else{
          drawModel(learningAgent.cMentalModel, learningAgent, count, fontSize, margin, modelHight);
        }
          count++;
        });
      })
  }


  drawModel = function (model, learningAgent, idx, fontSize, margin, modelHight) {
    
    if (model.length > 0) {
      let cw = (p5.width - (p5.width / 4)) / model.length;
      p5.textSize(fontSize);
      p5.fill(learningAgent.colorValues.rgb());
      p5.text(learningAgent.id, margin, margin + (modelHight / 2) + (idx * (modelHight + margin / 2)))
      for (let c = 0; c < model.length; c++) {
        if ((model[c] != "blanc")) {
          let tempColor = world.colors.find(col => {
            return col.name == model[c];
          });
          p5.fill(tempColor.chroma.rgb());
          p5.rect(p5.width / 4 + (c * cw), margin + (idx * (modelHight + margin / 2)), cw, modelHight);
        }
      }
    }
  }
}
vizLearnedModels = new p5(learnedModels, "LearnedModels");
