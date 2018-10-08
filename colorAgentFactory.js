
class ColorFactory{

	constructor(){
	this.colors = [];
	this.rgbValues = ["1 0.2 0"
					,"1 0.4 0"
					,"1 0.6 0"
					,"1 0.8 0"
					,"1 1 0"
					,"0.8 1 0"
					,"0.6 1 0"
					,"0.4 1 0"
					,"0.2 1 0"
					,"0 1 0"
					,"0 1 0.2"
					,"0 1 0.4"
					,"0 1 0.6"
					,"0 1 0.8"
					,"0.00784313725490196 1 1"
					,"0.011764705882352941 0.8 1"
					,"0.0196078431372549 0.6 1"
					,"0.0196078431372549 0.4 1"
					,"0.023529411764705882 0.2 1"
					,"0.023529411764705882 0 1"
					,"0.2 0 1"
					,"0.4 0 1"
					,"0.6 0 1"
					,"0.8 0 1"
					,"1 0 1"
					,"1 0 0.8"
					,"1 0.00784313725490196 0.6"
					,"1 0.011764705882352941 0.4"
					,"1 0.01568627450980392 0.2"];

		for (var i = this.rgbValues.length - 1; i >= 0; i--) {
			var tmp = this.rgbValues[i].split(" ");
			this.colors.push(chroma(tmp[0]*255,tmp[1]*255,tmp[2]*255));
		}
	}

	getTriad(){
		var tmp = []
		tmp.push(this.colors[0]);
		tmp.push(this.colors[15]);
		tmp.push(this.colors[28]);
		return tmp;

	}

	getPenta(){
		var tmp = []
		tmp.push(this.colors[0]);
		tmp.push(this.colors[7]);
		tmp.push(this.colors[15]);
		tmp.push(this.colors[21]);
		tmp.push(this.colors[28]);
		return tmp;

	}

	getNona(){
		var tmp = []
		tmp.push(this.colors[0]);
		tmp.push(this.colors[3]);
		tmp.push(this.colors[7]);
		tmp.push(this.colors[11]);
		tmp.push(this.colors[15]);
		tmp.push(this.colors[18]);
		tmp.push(this.colors[21]);
		tmp.push(this.colors[24]);
		tmp.push(this.colors[28]);
		return tmp;
	}

	getAll(){
		return this.colors;
	}

} 