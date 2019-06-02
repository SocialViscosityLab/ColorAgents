/**
* Spatial Mental Model
* This mental model is a mechanism to transduce values from other mental models into spatial distances.
* For example, it serves to map the perceived proximity between two colors into a spatial proximity
*/
class SpatialMentalModel{
  /*
  The model needs two parameters to determine what is close and what is far away. When shortests is not undefined
  it is assumed that it is equal to 0,
  */
  constructor(shortest,farthest){
    this.farthest = farthest;
    this.shortest = 0;
    if(shortest){
      this.shortest = shortest;
    }
  }

  setFarthest(val){
    this.farthest = val;
  }

  setShortest(val){
    this.shortest = val;
  }

  /**
  * Adapted from Processing's map() if either the second or third parameter are omited, the function uses current values
  * of this.shortest and this.farthest
  * @param val a value between 0 and 1. ! corresponds to the farthest perception
  */
  mapMagnitude(val,shortest,farthest){
    if (shortest && farthest){
      return shortest + (farthest - shortest) * (val / 1);
    } else {
      return this.shortest + (this.farthest - this.shortest) * (val / 1);
    }
  }
}
