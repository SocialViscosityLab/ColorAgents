// Global P5 instances
var mainP5, vizMatrix, viscositySeries, qualitySeries, vizLearnedModels;

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
    let NA;

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
        DOM.buttons.reset.onclick = function() {initialize(DOM.lists.cFactory.value)};
        DOM.buttons.runSweep.onclick = runSweep;
        DOM.buttons.resetSweep.onclick = function(){initialize(DOM.lists.cFactory.value)};
        DOM.lists.cFactory.addEventListener('change', () => {
            initialize(DOM.lists.cFactory.value);
        });
        DOM.sliders.news.addEventListener('change', () => {
            initialize(DOM.lists.cFactory.value);
        });
        DOM.buttons.trajectories_to_JSON.onclick = trajectoriesToJSON;
        DOM.buttons.trajectories_to_JSON2.onclick = trajectoriesToJSON2;
        DOM.buttons.trajectories_to_CSV.onclick = trajectoriesToCSV;

        // Create an agent for each color
        initialize(DOM.lists.cFactory.value);

        // let p = new PermutationHandler(20,4,10);
        // console.log(p.permutations)
        // console.log(p.size())
        // console.log(p.density())

    }

    function initialize(colorPaletteString) {
        // Instantiate all the colors
        if(colorPaletteString == 'munsellSplitPopulation'){
            var cFactory = new ColorFactory('munsell');
            world.permuLoaded = Utils.loadPermutations('munsell', p5)
    
        }else{
            var cFactory = new ColorFactory(colorPaletteString);
            world.permuLoaded = Utils.loadPermutations(colorPaletteString, p5)    
        }

        // Retrieve al the colors
        var colors = cFactory.getAll();

        //Set the number of new agents
        NA = DOM.sliders.news.value;
        // clear agents
        world.reset();
        world.colors = colors;
        vAgents = [];

        //Randomly select a predefine number of colors
        let nAgentID = [];
        let idsBucket = []
        for (let i = 0; i < colors.length; i++) {
            idsBucket.push(i);
        }
        for (let i = 0; i < NA; i++) {
            let randomIdx = Math.floor(Math.random() * idsBucket.length);
            nAgentID.push(idsBucket.splice(randomIdx, 1)[0]);
        }



        world.permuLoaded.then(modelPermu => {

            // create instances
            for (var i = 0; i < colors.length; i++) {
                let x = Math.floor(Math.random() * p5.width);
                let y = Math.floor(Math.random() * p5.height);
                if (nAgentID.includes(i)) {
                    console.log('The learning agents is ' + colors[i].name)
                    var agent = new NewHuman(x, y, colors[i].name, colors[i].chroma, 0, 100, modelPermu);
                    world.referenceModel = agent.getPerceivedColorDistanceFeatures(colors.map(a => a.name))
                } else {
                    if(colorPaletteString == 'munsellSplitPopulation'){
                        if(i%2== 0){
                            var agent = new Human(x, y, colors[i].name, colors[i].chroma, 'munsell', 0, 100);
                        }else{
                            var agent = new Human(x, y, colors[i].name, colors[i].chroma, 'munsellAlternated', 0, 100);
                        }
                    }
                    else{
                        var agent = new Human(x, y, colors[i].name, colors[i].chroma, colorPaletteString, 0, 100);
                    }
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
                vizLearnedModels.resetLastModel();
            } catch (error) {
                // error launched when vizMatrix is not hoisted.
            }

            Utils.resetRecorder();

            DOM.labels.agentsInWorld.innerHTML = world.observers.length;
            DOM.labels.humansInWorld.innerHTML = world.getHumans().length;
            DOM.labels.nonhumansInWorld.innerHTML = world.getNonhumans().length;
            let newAgentsName = world.getLearningAgents().map(a => a.id)
            DOM.labels.learningAgent.innerHTML = newAgentsName.join(", ");
            DOM.buttons.runSweep.innerHTML = "Start Sweep SImulation";
            DOM.buttons.runSweep.style.backgroundColor = "rgb(162, 209, 162)";

        });

        //Calculation the permutations
        //modelPermu = calculatePermutations()

    }

    // ***** DRAW ******
    p5.draw = function() {
        p5.background(50);

        if (world.permuLoaded) {
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
        }
    }



    //Function controlled by guy element that enables or disables the animation
    function runSimulation() {
        if (world.permuLoaded) {

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
                    //trajectoriesToCSV(label);
                    Utils.modelQualityToCSV(label, p5)
                    Utils.viscosityToCSV(label, p5)
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
                                for (let n = 0; n < param.rate.length; n++) {
                                    let next5 = param.rate[n]
                                    for (let s = 0; s < param.decreasing.length; s++) {
                                        let next6 = param.decreasing[s]
                                        for (let t = 0; t < param.exploration.length; t++) {
                                            let next7 = param.exploration[t]
                                                // number of repetitions
                                            for (let u = 0; u < param.runs; u++) {
                                                // Change DOM values for the condition values
                                                DOM.lists.cFactory.value = next0;
                                                DOM.lists.rule.value = next1;
                                                DOM.sliders.range.value = next2;
                                                DOM.lists.sensibility.value = next3;
                                                DOM.sliders.tolerance.value = next4;
                                                DOM.sliders.rate.value = next5;
                                                DOM.sliders.decreasing.value = next6;
                                                DOM.sliders.exploration.value = next7;
                                                let event = new Event('change');
                                                // Initialize all conditions
                                                DOM.lists.cFactory.dispatchEvent(event);
                                                // run the simulation IN A PROMISE
                                                let currentRun = next0 + ", " + next1 + ", " + next2 + ", " + next3 + ", tole " + next4 + ", lRate " + next5 + ", decr " + next6 + ", expl " + next7 + ", run " + u;
                                                await runSimulationSweep(currentRun)
                                            }
                                        }
                                    }
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
        if (!label || typeof(label) != "string") {
            label = 'trajectoriesCSV.csv'
        }
        p5.save(Utils.getRecording(), label);
        console.log("Saved: " + label);
    }


    /**
     * Calculate the permutations for the selected color model
     */
    function calculatePermutations() {
        mPermutations = []
        let agentsIDs = colors.map(c => c.name);
        if (colors.length < 10) {
            mPermutations = Utils.calculateCModelPermutations(agentsIDs);
            mPermutations.sort(function(a, b) { return 0.5 - Math.random() })
            p5.saveJSON(mPermutations, DOM.lists.cFactory.value);
            return mPermutations
        } else {
            Utils.calculateCModelPermutationSample(agentsIDs).then(function(permutations) {
                mPermutations = permutations;
                p5.saveJSON(permutations, DOM.lists.cFactory.value);
                return mPermutations
            });
        }

    }

    /**
     * Load local files with the saved permutations
     */
    function loadPermutations() {
        mPermutations = []
        let permuFileName = 'src/permutations/' + DOM.lists.cFactory.value + '.json';

        let p = p5.loadJSON(permuFileName, data => {
            console.log(data)
            mPermutations = Object.values(data)
            return mPermutations
        });
        return p;
    }

}

var mainP5 = new p5(main, "ColorAgents");