/**
* A color mental model is a ordered sequence of colors particular to each agent in
* the world. Every color mental model belongs to an agent, therefore, color mental
* models exist only in the 'mind' of each agent.
* By default this class provides the Newtonean rainbow model.
*/
class ColorMentalModel{

  constructor(colorPalette, sensibility, k){
    /** The array of colors used by this mental model. For instance a warm color set, a cold color set, a rainbow color set.*/
    var cFactory;

    if (colorPalette){
      cFactory = new ColorFactory(colorPalette);
    } else {
      // Instantiate all the colors
      cFactory = new ColorFactory('newton');
    }
    /** The color palette retrieved from the color Factory. By default it retrieves all the colors */
    this.colorPalette = cFactory.getAll();
    /* Sensibility is a function that represents the perceived proximity between colors from the reference point of an observer.
    If linear, the perceived proximity increases in equal steps as sorted colors distance from the reference point. If non-linear,
    the perceived proximity increases in greater steps for each sorted color, thus colors closer to the reference point appear way
    closer than distant colors. */

    /** The function of color sensibility. Could be euther linear or exponential*/
    this.sensibility;

    if(sensibility){
      this.sensibility = sensibility;
    }

    /** The index of the agent's color. Each agent implements a color mental model.*/
    this.myIndex;
  }

  /**
  * Finds the color index in a color palette
  * @param {Number} color the color to be matched to a color palette
  */
  setMyIndex(color){
    this.myIndex = this.findColorIndex(color);
  }

  /**
  Returns a value between 0 and 1, where 1 is the farthest perceived distance
  * @param reference the reference color`must be between 0 and colorPalette.length
  * @param target the color to be compared with must be between 0 and colorPalette.length
  * @return a value between 0 and 1, where 1 is the farthest perceived distance
  */
  getPerceivedColorDistance(target, reference){
    // Find index of reference color in the colorPalette.
    let refPos;
    if (reference != undefined){
      refPos = this.findColorIndex(reference);
    } else {
      refPos = this.myIndex;
    }
    // Find index of target color in the colorPalette.
    let targetPos = this.findColorIndex(target);
    // Use the sensibility function to get the perceived distance between the reference and the target
    // return the perceived distance
    return this.calcPerceivedDist(refPos, targetPos);
  }

  /**
  * Finds the index of a color in a given palette. If the exact color is not found, then it retrievs the closes.
  It uses lodas.js https://lodash.com/ to evaluale object attributes (value equality) equality and chroma.js
  library to estimate te color proximity
  * @param color the color to be matched in the palette
  * @param pal the palette to be used. If undefined the palette of this cMentalModelis used
  */
  findColorIndex(color, pal){
    let palette = pal;
    if (palette == undefined){
      palette = this.colorPalette;
    }

    // This search for the exact match with any of the colors in the palette
    for (let i = 0; i < palette.length; i++) {
      if (_.isEqual(palette[i].chroma, color)){
        return i;
      }
    }

    // If the color was not found in the previous search,
    // this search for the closest color to any of the colors in the palette
    let index;
    let colorDistance;
    for (let i = 0; i < palette.length; i++) {
      let tmp = chroma.distance(color, this.colorPalette[i].chroma);
      if (tmp < colorDistance){
        colorDistance = tmp;
        index = i;
      }
    }
    return index;
  }

  /**
  Returns a value between 0 and 1, where 1 is the farthest perceived distance
  indexA and indexB must be between 0 and colorPalette.length
  */
  calcPerceivedDist(indexA, indexB){
    if (indexA < this.colorPalette.length && indexB < this.colorPalette.length){
      let delta = Math.abs(indexA - indexB);
      switch (this.sensibility){
        case 'linear':
        return delta/(this.colorPalette.length-1);
        break;
        case 'exponential':
        // this function is y = a^x where 0<a<1. The closer to 0 the tightest the graph elbow. 0.97 is a good number
        /* This reseambles the exponential model of human perception defined by Stevens (1975) in
        Psychophysics: introduction to its perceptual, neural, and social prospects. Wiley
        */
        return 1- Math.pow(0.97,delta);
        break;
      }
    }else{
      console.log('index value exceeds color array length');
    }
  }

  /**
   * Returns a binary signal if a target color is between a given percentage similarity in the current colorpalette
   * @param  {Color}  target     target color
   * @param  {Number}  percentage percentage of "color similarity"
   * @return {Boolean}            True if the target color is similar enough to the index of this cMentalModel
   */
  isActionTrigger(target, percentage){
    let tarIndex = this.findColorIndex(target);
    let distEnd = (this.colorPalette.length - this.myIndex) -1;
    let range;

    // get the percentage range
    if (this.myIndex < distEnd){
      range = Math.round(distEnd * percentage);
    } else {
      range = Math.round(this.myIndex * percentage);
    }

    if (tarIndex < this.myIndex){
      if ((this.myIndex - range) <= tarIndex){
        //  console.log("  range: " +range + "  tar: "+tarIndex);
        return true;
      }
    } else {
      if (tarIndex <= (this.myIndex + range)){
        //  console.log("  range: " +range + "  tar: "+tarIndex);
        return true;
      }
    }
    //  console.log("  range: " +range+ "  tar: "+tarIndex +"  color beyond boundaries" );
    return false;
  }
}
