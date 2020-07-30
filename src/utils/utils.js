var startTime;
var tmpLabels = [];
var tmpValues = [];
var returnValues = [];
/**
 * Abstract class with utility functions
 */
class Utils {
    // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
    constructor() {}

    /**
     * Euclidean distance between this agent and other agent
     */
    static euclideanDist(agentA, agentB) {
        return Utils.dist(agentA.pos.x, agentA.pos.y, agentB.pos.x, agentB.pos.y);
    }

    /**
     * Adapted from Processing's map()
     */
    static dist(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }


    /**
     * Selects the euclidean closest n agents to this agent
     * @param {Agent} thisAgent the reference agent to which this function is applied
     * @param {Number} n the amount of agents to be retrieved
     * @param {Array} otherAgents the agents to validate if they are in front of this agent. If omited, the pairs of thisAgent are used
     * @return {Array} The top 'n' closest interactants
     */
    static chooseNClosest(thisAgent, n, otherAgents) {

        let pairs;
        if (!otherAgents) {
            pairs = thisAgent.getPairs();
        } else {
            pairs = otherAgents;
        }

        let tempCollection = [];

        // calculate distance to all the pairs
        for (let i of pairs) {
            let proximity = Utils.euclideanDist(thisAgent, i.agent);
            tempCollection.push({ agent: i, prox: proximity });
        }
        // sort them by proximity
        tempCollection.sort(function(a, b) {
            return a.prox - b.prox;
        });
        // sets the upper limit of n
        if (n > pairs.length) {
            n = pairs.length;
        }
        // reset all the agents
        for (let a of pairs) {
            a.interactant = false;
        }
        // enable the top N
        for (var i = 0; i < n; i++) {
            for (let a of pairs) {
                if (_.isEqual(a, tempCollection[i].agent)) {
                    a.interactant = true;
                }
            }
        }
        return pairs;
    }

    /**
     * Choose the agents within a given radius around this agent
     * @param {Agent} thisAgent the reference agent to which this function is applied
     * @param {Number} r the lenght of the radius (scope) around this agent
     * @param {Array} otherAgents the agents to validate if they are in front of this agent. If omited, the pairs of thisAgent are used
     * @return {Array} The agents within the radius
     */
    static chooseByRadius(thisAgent, r, otherAgents) {

        let pairs;
        if (!otherAgents) {
            pairs = thisAgent.getPairs();
        } else {
            pairs = otherAgents;
        }

        // calculate distance to all the pairs
        for (let i of pairs) {
            let proximity = Utils.euclideanDist(thisAgent, i.agent);
            if (proximity <= r) {
                i.interactant = true;
            } else {
                i.interactant = false;
            }
        }
        return pairs;
    }

    /**
     * Choose the agents in front of this agent. 'In front' is defined by the bearing of this agent
     * @param {Agent} thisAgent the reference agent to which this function is applied
     * @param {Number} k the lenght of the radius scope or the amount of nearby agents to be retrieved
     * @param {Array} otherAgents the agents to validate if they are in front of this agent. If omited, the pairs of thisAgent are used
     * @return {Array} The agents within the perception field
     */
    static chooseByField(thisAgent, k, otherAgents) {

        let pairs;

        if (!otherAgents) {
            pairs = thisAgent.getPairs();
        } else {
            pairs = otherAgents;
        }

        //filter interactants by perception scope
        pairs = this.chooseByRadius(thisAgent, k, pairs);

        for (let a of pairs) {
            if (a.interactant == true) {
                let angleBetween = Math.atan2(a.agent.pos.y - thisAgent.pos.y, a.agent.pos.x - thisAgent.pos.x);
                if (thisAgent.bearing - thisAgent.visualPerceptionAngle / 2 < angleBetween && angleBetween < thisAgent.bearing + thisAgent.visualPerceptionAngle / 2) {
                    a.interactant = true;
                } else {
                    a.interactant = false;
                }
            }
        }

        return pairs;
    }



    static setStartTime() {
        return startTime = new Date();
    }

    static getExecutionTime() {
        var currentTime = new Date();
        var timeDiff = currentTime - this.startTime; //in ms
        // strip the ms
        timeDiff /= 1000;
        // get seconds
        var seconds = Math.round(timeDiff);
        return seconds;
    }


    /**
     * Calculate a model's quality based on the reference worlds model
     * @param {Object} evaluatedModel current featured Model of a learning agents 
     * @param {Object} referenceModel Common featured Model in the word
     * @return {Float}  Quality value of the evaluated model based on the common featured model
     */
    static calculateModelRealQuality(evaluatedModel){
        let referenceModel = world.referenceModel;
        let quality = 0;
        if(evaluatedModel != { }){
            for (let c in evaluatedModel) {
                if(evaluatedModel[c] === referenceModel[c]){
                quality  += 0.01;
                }else{
                    quality -= 0.01;
                }
            }
        }
        return quality;
    }



    /**
     * Combine the agents in different orders to create possible color models
     * @param {Array} agents list of agents' ids
     * @return {Array} List of meaningful model permutations
     */
    static calculateCModelPermutations(agents){
    let permutations = []
    let cmbs = Combinatorics.permutation(agents).toArray();
    cmbs.forEach(cmb => {
        let invModel = cmb.reverse().join(" ");
        
        if(!permutations.includes(invModel)){
            permutations.push(cmb.reverse().join(" "));
        }
    });
    return permutations;
    }

    /**
     * Combine the agents in different orders to create possible color models
     * @param {Array} agents list of agents' ids
     * @return {Array} List of meaningful model permutations
     */
    static calculateCModelPermutationSample(agents){
        let permutations = []
        // Promise
        var permuProm = new Promise(function (resolve, reject) {
                let p = new PermutationHandler(agents.length,2,10);
                let samples = p.permutations;
                // the higher that it goes with n=20 is depth = 4 and samples = 10
                console.log(p.size())
                console.log(p.density())

                samples.forEach(sample => {
                    let tempS = sample.split(" ").map(x => agents[x]);
                    let invModel = tempS.reverse().join(" ");
                    
                    if(!permutations.includes(invModel)){
                        permutations.push(tempS.reverse().join(" "));
                    }
                });
                if (permutations.length > 0){
                    //console.log(permutations)
                    resolve(permutations);
                }else{
                    var reason = new Error('no permutations');
                    reject(reason); // reject
                }
            });
        return permuProm;
    }
        
    /**
     * Combine the agents in different orders to create possible color models
     * @param {String} agentGroup list of agents' ids
     * @return {Array} List of model permutations or its promes
     */
    static loadPermutations(agentGroup, p5){
        let permutations = []
        let permuFileName = 'src/permutations/'+agentGroup+'.json';
        // Promise
        var permuProm = new Promise(function (resolve) {
        
            p5.loadJSON(permuFileName, data =>{
                permutations = data
                resolve(permutations);
                });
            });
        return permuProm;
    }

    // DATA RECORDER
    static startRecording(val) {
        this.tmpLabels.push('tick');
        this.tmpValues.push(val);
    }

    static recordData(val) {
        this.tmpLabels.push(val.id + '_x');
        this.tmpLabels.push(val.id + '_y');
        this.tmpValues.push(val.pos.x);
        this.tmpValues.push(val.pos.y);
    }

    static endRecording() {
        this.returnValues.splice(0, 1, this.tmpLabels);
        this.returnValues.push(this.tmpValues);
    }

    static getRecording() {
        return Array.from(this.returnValues);
    }

    static clearRecorder() {
        this.tmpLabels = [];
        this.tmpValues = [];
    }

    static resetRecorder() {
        this.clearRecorder();
        this.returnValues = [];
    }

  // Exports global viscosity to CSV. The file is saved in user's download folder
  static modelQualityToCSV(fileName, p5){
    let file = [];
    // first iterator
    for (let t = 0; t < metrics.globalQualityData.length; t++) {
      const qualityRecord = metrics.globalQualityData[t];
      file.push([t, qualityRecord.qValue,qualityRecord.rqValue]);
    }
      p5.save(file, fileName+'_quality.csv');
  }
    // Exports global viscosity to CSV. The file is saved in user's download folder
    static viscosityToCSV(fileName, p5){
        let file = [];
        // first iterator
        let itr = metrics.globalViscosityData.entries();
        let item = itr.next();
        while(!item.done){
          file.push([item.value[0],item.value[1]]);
          item = itr.next();
        }
        p5.save(file, fileName+'_viscosity.csv');
      }

    
    // // Exports global viscosity to CSV. The file is saved in user's download folder
    // static modelQualityToCSV(fileName, p5){
    //     console.log("Heli")
    //     let file = []
    //     // first iterator
    //     let itr = metrics.globalQualityData.entries();
    //     let item = itr.next();
    //     while(!item.done){
    //         console.log(item)
    //         file.push([item.value[0],item.value[1]]);
    //         item = itr.next();
    //     }
    //     if (fileName !== undefined){
    //         p5.save(file, fileName+'.csv');
    //     }else{
    //         p5.save(file, 'globalQualityCSV.csv');
    //     }
    // }

}