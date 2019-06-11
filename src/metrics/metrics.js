/**
* Notes:
* Urbana, May 2019
* 1. Social viscosity measures the evolution of where I am in contrast to where
* I want to be in relation to all my interactants
*
* 2.Social viscosity measures the contrast between where I am and where I want
* to be in relation to all my interactants over a period of time, i.e., the execution
* of a task or a practice.
*
* Santa Marta, June 2019
* 3. Social viscosity is estimated by contrasting "where I am" with "where I intend
* to be" in relation to all my interactants over the duration of an action, task or practice.
*
* The same could also be reframed:
* 4. The viscosity of a social practice is estimated by contrasting where
* agents "intended to be" with where they "ended" after the execution of social actions.
* The meaning of "where" includes the interactions with all their interactants
* and the world.
*/

class Metrics{
  constructor(world){
    this.world = world;
    /** The metricsMap is a nested structure of key-value pairs. At the top of the
    structure there is a Map whose keys are timeStamps provided by the world. For
    each timeStamp there is a collection of all the interactions occurred at that
    moment organized by agents. Such inner collection is also a map of key-value
    pairs where the key is the agent and the pair is an array of interactions of that
    agent with all the others.
    */
    this.metricsMap = new Map();
    this.agents = world.getHumans();
    this.collection = [];
  }

  /**
  * [calcMetrics description]
  * @return {[type]} [description]
  */
  getMetricsData(){
    let innerMap = new Map();

    // Get interactions for each agent in current time
    for (let agent of this.agents) {
      this.getInteractions(innerMap, agent);
    }

    //save interactions for the current tick time.
    this.metricsMap.set(world.getTics(), innerMap);

  //  console.log("viscosity at 1 for RED: " + this.viscosityAtFor(1,this.agents[0]));
  //  console.log("global viscosity at current time : " + this.calcViscosityAt(world.getTics()));
  //  console.log(this.metricsMap);
  }

  /**
  * [getInteractions description]
  * @param  {[type]} innerMap [description]
  * @param  {[type]} agent    [description]
  * @return {[type]}          [description]
  */
  getInteractions(innerMap, agent){
    // retrieve agent's interactants
    let interactants = agent.retrieveInteractants();

    let interactions = [];

    // Iterate over its interactants 'i' at the previous time step
    for(let interactant of interactants){

      let intendedDist;

      try{
        // Take the intendend distances in the previous time step to each interactant
        intendedDist = agent.distancesMap.get(interactant.agent.id).spatialMag;
      }
      catch(error){
        // It might be the case that at the current time these agents start an
        // inteaction. Therefore there is no stored spatialMag in the previuos
        // time tick. In that case the intendedDist is set to 0.
        intendedDist = 0;
      }

      // Take the current distance to each 'i'
      let currentDist = Utils.euclideanDist(agent, interactant.agent);

      // Calculate weighted difference
      let weightedDeltaDist = ((currentDist - intendedDist) / intendedDist);

      // If the intendedDist == 0 then the weightedDeltaDist will be infinite.
      // That does not make sense because it would mean that Agent estimated to
      // be ininitely far away from the interactant. Thus, weightedDeltaDist is set to 0
      if (!isFinite(weightedDeltaDist)){
        weightedDeltaDist = 0;
      }

      // Timetag it and record interaction
      interactions.push({interactant:interactant.agent.id, spatialMag:intendedDist, currentDist:currentDist, weightedDifference:weightedDeltaDist});
    }

    //  store the interactions with each agent
    innerMap.set(agent,interactions);
  }

  /**
  * Retrieves the array of interactions stored in an innerMap. The key (time) retrieves
  * the corresponding innerMap, the agent key retrieves the corresponding array.
  * @param  {Number]} time  The tick number from the sequence of stored interactions
  * @param  {Agent} agent The agent from which the interactions are retrieve.
  * @return {Array} The array of interactions stored for a given agent.
  */
  retrieveInteractionsAtFor(time, agent){
      return this.metricsMap.get(time).get(agent);
  }

  /**
  * Retrieves the innerMap stored in the given key (time) from the metricsMap.
  * @param  {Number]} time  The time tick of the sequence of stored interactions
  * @return {Map} The array of interactions stored for a given agent. If agent
  * is undefined it returns the innerMap corresponding to the given time
  */
  retrieveInteractionsAt(time){
      return this.metricsMap.get(time);
  }

  /**
  * [calcViscosityAt description]
  * @param  {[type]} time [description]
  * @return {[type]}      [description]
  */
  calcViscosityAt(time){
    // Get the innerMap of interactions at given time
    let interactions = this.retrieveInteractionsAt(time);

    let globalAccumulate = 0;

    // iterate over each agent
    interactions.forEach((key,agent)=>{

      globalAccumulate += this.viscosityAtFor(time, agent);

    });

    // average by agents
    globalAccumulate = globalAccumulate/interactions.size;

    // return averaged result
    return globalAccumulate;
  }

  /**
  * [calcViscosityForAgentAt description]
  * @param  {[type]} time [description]
  * @param  {[type]} agent  [description]
  * @return {[type]}       [description]
  */
  viscosityAtFor(time, agent){

    // Get the array of interactions at given time
    let interactions = this.retrieveInteractionsAtFor(time, agent);

    let innerAccumulate = 0;

    // iterate over the interactants
    for (let interactant of interactions) {

      // accumulate the weightedDeltaDist
      innerAccumulate += interactant.weightedDifference;
    };

    // average by getInteractants
    innerAccumulate = innerAccumulate /interactions.length;

    // return averaged result
    return innerAccumulate;
  }
}
