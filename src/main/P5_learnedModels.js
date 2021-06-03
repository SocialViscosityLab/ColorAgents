var learnedModels = function(p5) {

    let lastModel;
    let lastModelTick = -1;
    let learningAgents;

    p5.setup = function() {
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

    loadAgents = function() {
        world.permuLoaded.then(a => {
            learningAgents = world.getLearningAgents();
        })
    }

    p5.setLastModels = function(time) {
        if (time != lastModelTick) {
            lastModel = metrics.getModelsAt(time);
            lastModelTick = time;
        }
    }

    p5.resetLastModel = function() {
        lastModel = undefined;
    }

    p5.draw = function() {
        p5.background(220);
        p5.noStroke();
        world.permuLoaded.then(x => {
            let arraySize = learningAgents.length;
            let margin = 25;
            let fontSize = 20;
            let modelHight = (p5.height - (margin * 2) - (margin * arraySize / 4)) / arraySize;
            let count = 0;

            learningAgents.forEach(learningAgent => {
                if (lastModel != undefined) {
                    if (lastModel.length > 0) {
                        let register = lastModel.find(r => { return r.id == learningAgent.id });
                        // convert from string to array
                        let model = register.model.split(' ');
                        drawModel(model, learningAgent, count, fontSize, margin, modelHight);

                    } else {
                        drawModel(learningAgent.cMentalModel, learningAgent, count, fontSize, margin, modelHight);
                    }
                } else {
                    drawModel(learningAgent.cMentalModel, learningAgent, count, fontSize, margin, modelHight);
                }
                count++;
            });
        })
    }

    /**
     * model is an array of color names organized by the learning agent
     */
    drawModel = function(model, learningAgent, idx, fontSize, margin, modelHight) {

        if (model.length > 0) {

            let x = p5.width / 2;
            let y = p5.height / (2 * learningAgents.length);
            let center = p5.createVector(x, y + (y * 2 * idx));
            let diam = (p5.height - 150) / (2 * learningAgents.length);
            let angle = p5.TWO_PI / model.length;

            // color name
            p5.fill(learningAgent.colorValues.rgb());
            p5.textSize(fontSize);
            p5.textAlign(p5.CENTER, p5.CENTER)
            p5.text(learningAgent.id, center.x, center.y);

            for (let c = 0; c < model.length; c++) {
                if ((model[c] != "blanc")) {
                    let tempColor = world.colors.find(col => {
                        return col.name == model[c];
                    });

                    if (tempColor.chroma) {
                        p5.fill(tempColor.chroma.rgb());
                    } else {
                        p5.noFill();
                    }

                    let xPos = Math.cos(c * angle) * diam;
                    let yPos = Math.sin(c * angle) * diam;
                    p5.ellipse(center.x + xPos, center.y + yPos, 30, 30)

                }
            }
        }
    }
}
vizLearnedModels = new p5(learnedModels, "LearnedModels");