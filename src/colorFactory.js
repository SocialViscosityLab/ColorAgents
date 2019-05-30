/**
 * A factory of color palettes
 */
class ColorFactory{

/**
 * Constructor
 * @param {String} cSpace The name of color palette from the menu of available palettes: RGB, MUNSELL, SECONDARY, BINARY TEST
 */
	constructor(cSpace){
		this.colors = [];
		// This code must change. It should read all the palettes available in the sequential palettes folder. Ideally palettes
		// should use JSON format
		this.newtonValues = ["1 0.2 0"
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

		this.munsellValues = ["0.9254901960784314 0.9098039215686274 0.07450980392156863",
		"0.6901960784313725 0.8196078431372549 0.21176470588235294",
		"0.24313725490196078 0.7137254901960784 0.28627450980392155",
		"0.11372549019607843 0.6666666666666666 0.47058823529411764",
		"0.11372549019607843 0.6627450980392157 0.5411764705882353",
		"0.12941176470588237 0.6549019607843137 0.615686274509804",
		"0.11764705882352941 0.6470588235294118 0.6745098039215687",
		"0.12941176470588237 0.5843137254901961 0.6862745098039216",
		"0.08235294117647059 0.5176470588235295 0.7019607843137254",
		"0.047058823529411764 0.4392156862745098 0.7215686274509804",
		"0.40784313725490196 0.3176470588235294 0.6352941176470588",
		"0.5450980392156862 0.2549019607843137 0.6",
		"0.6745098039215687 0.19215686274509805 0.5764705882352941",
		"0.807843137254902 0.0784313725490196 0.5058823529411764",
		"0.8862745098039215 0.08235294117647059 0.403921568627451",
		"0.9294117647058824 0.10588235294117647 0.25098039215686274",
		"0.9450980392156862 0.35294117647058826 0.1450980392156863",
		"0.9529411764705882 0.5372549019607843 0.12549019607843137",
		"0.9529411764705882 0.6705882352941176 0.10588235294117647",
		"0.9372549019607843 0.807843137254902 0.07450980392156863"];

		this.secondaryValues = [
			"0.9372549019607843 0.1803921568627451 0.19215686274509805",
			"0.9607843137254902 0.5058823529411764 0.07058823529411765",
			"1 0.9411764705882353 0",
			"0.07450980392156863 0.6549019607843137 0.3254901960784314",
			"0.25098039215686274 0.3333333333333333 0.6823529411764706",
			"0.6431372549019608 0.16862745098039217 0.611764705882353",
		]

		this.test = [
				"0.9372549019607843 0.1803921568627451 0.19215686274509805",
				"0.07450980392156863 0.6549019607843137 0.3254901960784314",
				"0.6431372549019608 0.16862745098039217 0.611764705882353",
		]

		this.initialize(cSpace);
	}

/**
 * Retrieves the color for the required color space
 * @param  {String} cSpace The required color space
 * @return {Array}        [description]
 */
	 initialize(cSpace){
		switch(cSpace){
			// ---- RGB
			case 'newton':
			for (var i = 0; i < this.newtonValues.length ; i++) {
				var tmp = this.newtonValues[i].split(' ');
				this.colors.push({name:i , chroma:chroma(tmp[0]*255,tmp[1]*255,tmp[2]*255)});
			}
			break;
			// ---- MUNSELL
			case 'munsell':
			let munsellNames=["cGR","dGR","	*cGR","dR","cR","dRVi","cRVi","dVi","cVi","dViA","cViA","dA","cA","dAV","cAV","dV","cV","dVG","cVG","dG"]

			for (var i = this.munsellValues.length - 1; i >= 0; i--) {
				var tmp = this.munsellValues[i].split(' ');
				this.colors.push({name:munsellNames[i] , chroma:chroma(tmp[0]*255,tmp[1]*255,tmp[2]*255)});
			}
			break;
			// ---- SECONDARY
			case 'secondary':
			let secondaryNames=['red','org','yel','gre','blu','pur'];

			for (var i = 0; i < this.secondaryValues.length; i++) {
				var tmp = this.secondaryValues[i].split(' ');
				this.colors.push({name:secondaryNames[i] , chroma:chroma(tmp[0]*255,tmp[1]*255,tmp[2]*255)});
			}
			break;
			// ---- BINARY TEST
			case 'test':
			let test=['red','gre','pur'];

			for (var i = 0; i < this.test.length; i++) {
				var tmp = this.test[i].split(' ');
				this.colors.push({name:test[i] , chroma:chroma(tmp[0]*255,tmp[1]*255,tmp[2]*255)});
			}
			break;
		}
	}

	getAll(){
		return this.colors;
	}

	getMunsell(){
		initialize('munsell');
		return this.colors;
	}

	getNewton(){
		initialize('newton');
		return this.colors;
	}

}
