// Global P5 instances
var mainP5, vizMatrix, viscositySeries;

// The global variable world
var world;

// The global variable for metrics
var metrics;

var main = function(p5) {
    // Boolean variable to control the animation
    let running;
    // This variable controls the simulation pace
    let simulationInterval;
    // This variable controls the metrics pace
    let metricsInterval;
    // This variable controls the sweep simulation pace
    let sweepSimulationInterval;
    // This variable controls the sweep metrics pace
    let sweepMetricsInterval;
    // The visual elements representing agents from the world
    let vAgents = [];
    // Number of new agents 
    let NA = 1;
    let nAgents = [];
    // Reference for test new agents model
    let nAP;

    // ***** Setup ******
    p5.setup = function() {

        p5.createCanvas(500, 500);
        // Instantiate the world
        world = new World();

        // Animation starts on hold
        running = false;

        // set GUI elements
        DOM.initialize();
        DOM.buttons.run.onclick = runSimulation;
        DOM.buttons.reset.onclick = initialize;
        DOM.buttons.runSweep.onclick = runSweep;
        DOM.buttons.resetSweep.onclick = initialize;
        DOM.lists.cFactory.addEventListener('change', () => {
            initialize();
        })
        DOM.buttons.trajectories_to_JSON.onclick = trajectoriesToJSON;
        DOM.buttons.trajectories_to_JSON2.onclick = trajectoriesToJSON2;
        DOM.buttons.trajectories_to_CSV.onclick = trajectoriesToCSV;

        // Create an agent for each color
        initialize(DOM.lists.cFactory.value);
    }

    function initialize() {
        // Instantiate all the colors
        var cFactory = new ColorFactory(DOM.lists.cFactory.value);

        // Retrieve al the colors
        var colors = cFactory.getAll();
        nAP = colors;

        // clear agents
        world.reset();
        vAgents = [];

        let nAgentID = [];
        //New agent initialization
        for (let i = 0; i < NA; i++) {
            nAgentID.push(Math.floor(Math.random()* (colors.length-1)));
        }
        //let nAgentID = Math.floor(Math.random()* (colors.length-1));
        nAgents = [];
        // create instances
        for (var i = 0; i < colors.length; i++) {
            let x = Math.floor(Math.random() * p5.width);
            let y = Math.floor(Math.random() * p5.height);
            if (nAgentID.includes(i)){
                var agent = new NewHuman(x, y, colors[i].name, colors[i].chroma, 0, 100);
                nAgents.push(agent);
            }
            else {var agent = new Human(x, y, colors[i].name, colors[i].chroma, DOM.lists.cFactory.value, 0, 100);
            }
            //	agents.push(agent);
            world.subscribe(agent);

            //for each agent instantiate one vAgent
            vAgents.push(new VAgent(p5, agent));
        }

        Utils.setStartTime();

        // setup metrics
        metrics = new Metrics(world);

        // Reset matrix visualizer
        try {
            vizMatrix.resetLastMatrix();
        } catch (error) {
            // error launched when vizMatrix is not hoisted.
        }

        //
        Utils.resetRecorder();

        DOM.labels.agentsInWorld.innerHTML = world.observers.length;
        DOM.labels.humansInWorld.innerHTML = world.getHumans().length;
        DOM.labels.nonhumansInWorld.innerHTML = world.getNonhumans().length;
        let newAgentsName = nAgents.map(a => a.id)
        DOM.labels.learningAgent.innerHTML = newAgentsName.join(", ");
        DOM.buttons.runSweep.innerHTML = "Start Sweep SImulation";
        DOM.buttons.runSweep.style.backgroundColor = "rgb(162, 209, 162)";
    }

    // ***** DRAW ******
    p5.draw = function() {
        p5.background(250, 250, 250);

        // go over all the agents
        for (var a = 0; a < vAgents.length; a++) {

            //show agent
            if (DOM.checkboxes.showAgents.checked) {
                vAgents[a].show();
            }

            // show network
            if (DOM.checkboxes.showInteractions.checked) {
                vAgents[a].visualizeInteractions();
            }

            //
            if (DOM.checkboxes.showPerceptionField.checked) {
                vAgents[a].showPerceptionField();
            }

            // animate agents
            if (DOM.checkboxes.showTrajectories.checked) {
                vAgents[a].showTrajectory();
            }
        }
        /***
           * Updated the learned colormodel from the new agent
           * TODO: Take to a better place
           */ 
          p5.noStroke();
          let ss = 20;
          let count = 0;
          nAgents.forEach(nAgent => {
            let cm = nAgent.cMentalModel;
            if(cm.length>0){
                p5.textSize(20);
                p5.fill(nAgent.colorValues.rgb());
                p5.text(nAgent.id, p5.width-(ss*cm.length)-80, 20 + (count*(ss+4)))
                  for (let c = 0; c < cm.length; c++) {
                      if((cm[c]!= "blanc")){
                        let tempColor = nAP.find(col => {
                            return col.name == cm[c];
                        });
                        p5.fill(tempColor.chroma.rgb());
                        p5.rect(p5.width-(ss*cm.length)+(c*ss), 0+(count*(ss+4)), ss, ss);
                      }
                    }
                      count ++;    
                } 
            });
    }



    //Function controlled by guy element that enables or disables the animation
    function runSimulation() {
        running = !running;
        if (running) {
            // the max number of iterations the internal tick counter should get before stopping the simmulation 
            let iterations;
            if (DOM.checkboxes.sweepDuration.checked) {
                iterations = DOM.sliders.duration.value;
            } else {
                iterations = Infinity;
            }
            // the interval controlling how often the world updates itself. Units in milliseconds
            let interval = DOM.sliders.tickLength.value;

            simulationInterval = setInterval(() => { world.runAgents(iterations) }, interval);
            // calculate metrics
            metricsInterval = setInterval(() => {
                    metrics.getMetricsData(),
                        vizMatrix.setLastMatrix(world.getTicks())
                },
                interval);

        } else {
            clearInterval(simulationInterval);
            clearInterval(metricsInterval);
        }

        // Update DOM element content
        if (running) {
            DOM.buttons.run.innerHTML = "Running";
            DOM.buttons.run.style.backgroundColor = "rgb(240, 162, 186)";
        } else {
            DOM.buttons.run.innerHTML = "On hold";
            DOM.buttons.run.style.backgroundColor = "rgb(162, 209, 162)";
        }
    }


    //Function controlled by guy element that enables or disables the animation
    function runSimulationSweep(label) {
        return new Promise(function(resolve, reject) {
            // the max number of iterations the internal tick counter should get before stopping the simmulation 
            let iterations = DOM.sliders.duration.value;

            // the interval controlling how often the world updates itself. Units in milliseconds
            let interval = DOM.sliders.tickLength.value;

            // Change the GUI button
            DOM.buttons.runSweep.innerHTML = "Running: " + label;
            DOM.buttons.runSweep.style.backgroundColor = "rgb(240, 162, 186)";

            sweepSimulationInterval = setInterval(() => {
                world.runAgents(iterations);
                if (world.ticks == iterations) {
                    trajectoriesToCSV(label);
                    clearInterval(sweepSimulationInterval);
                    clearInterval(sweepMetricsInterval);
                    DOM.buttons.runSweep.innerHTML = "Completed";
                    DOM.buttons.runSweep.style.backgroundColor = "rgb(204, 202, 133)";
                    resolve();
                }
            }, interval);

            // calculate metrics
            sweepMetricsInterval = setInterval(() => {
                    metrics.getMetricsData(),
                        vizMatrix.setLastMatrix(world.getTicks())
                },
                interval);
        })
    }

    /**
     * Asynch function that executes a series of simulation runs with the parameters given. The parameters are arrays containing
     * the conditions to be tested. The conditions are executed in the following order: 1) ColorFactory, 2)interaction rule
     * 3) range, 4) sensibility, 5) tolerance, 6) Number of runs.
     * 
     * @param {Object} param Object containing key:value pairs where the keys must match these names: cFactory, rule, range,
     * sensibility, tolerance, runs. The corresponding values must be arrays of categorical parameters. In the case of continuous inputs,
     * such as sliders, the array of all steps from the min to the max value of the slider must be added. For convenience, the class
     * DOM has the abstract methods getListOptions() and getSliderParams() to retrieve all the categorical values of lists and sliders
     * from the HTML GUI elements. 
     */
    async function runSweep(param) {
        // This guarantees that each run has a time limit
        DOM.checkboxes.sweepDuration.checked = true;

        // If no parameters are provided, they are retrieved from the user input on the GUI interface
        if (param instanceof MouseEvent) {
            param = DOM.getSweepParams();
        }

        if (param instanceof Object) {
            // cFactory
            if (!param.cFactory) {
                param.cFactory = [DOM.lists.cFactory.value];
            }
            for (let i = 0; i < param.cFactory.length; i++) {
                let next0 = param.cFactory[i]
                    // iRule
                if (!param.rule) {
                    param.rule = [DOM.lists.rule.value];
                }
                for (let j = 0; j < param.rule.length; j++) {
                    let next1 = param.rule[j]
                        // scope
                    if (!param.range) {
                        param.range = [DOM.sliders.range.value];
                    }
                    for (let k = 0; k < param.range.length; k++) {
                        let next2 = param.range[k]
                            // sensibility
                        if (!param.sensibility) {
                            param.sensibility = [DOM.lists.sensibility.value];
                        }
                        for (let l = 0; l < param.sensibility.length; l++) {
                            let next3 = param.sensibility[l]
                                // tolerance
                            if (!param.tolerance) {
                                param.tolerance = [DOM.sliders.tolerance.value];
                            }
                            for (let m = 0; m < param.tolerance.length; m++) {
                                let next4 = param.tolerance[m]
                                    // number of repetitions
                                for (let n = 0; n < param.runs; n++) {
                                    // Change DOM values for the condition values
                                    DOM.lists.cFactory.value = next0;
                                    DOM.lists.rule.value = next1;
                                    DOM.sliders.range.value = next2;
                                    DOM.lists.sensibility.value = next3;
                                    DOM.sliders.tolerance.value = next4;
                                    let event = new Event('change');
                                    // Initialize all conditions
                                    DOM.lists.cFactory.dispatchEvent(event);
                                    // run the simulation IN A PROMISE
                                    let currentRun = next0 + ", " + next1 + ", " + next2 + ", " + next3 + ", " + next4 + ", run " + n;
                                    await runSimulationSweep(currentRun)
                                }
                            }
                        }
                    }
                }
            }
        } else {
            alert("Wrong parameter format for sweep run")
        }
    }

    function trajectoriesToJSON() {
        let file = []
        world.getAgents().forEach((agent) => {
            file.push({ agent: agent.id, locations: agent.locations })
        })
        p5.saveJSON(file, 'trajectories.json');
    }

    function trajectoriesToJSON2() {
        p5.saveJSON(Utils.getRecording(), 'trajectoriesV2.json', true);
    }

    function trajectoriesToCSV(label) {
        if (!label) {
            label = 'trajectoriesCSV.csv'
        }
        p5.save(Utils.getRecording(), label);
        console.log("Saved: " + label + " CSV File saved");
    }
}

var mainP5 = new p5(main, "ColorAgents");