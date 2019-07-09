/**
* A factory of color palettes
*/
class ColorFactory {

	/**
	* Constructor
	* @param {String} cSpace The name of color palette from the menu of available palettes: RGB, MUNSELL, SECONDARY, BINARY TEST
	*/
	constructor(cSpace) {
		this.colors = [];
		// This code must change. It should read all the palettes available in the sequential palettes folder. Ideally palettes
		// should use JSON format
		this.newtonValues = ["1 0.2 0"
			, "1 0.4 0"
			, "1 0.6 0"
			, "1 0.8 0"
			, "1 1 0"
			, "0.8 1 0"
			, "0.6 1 0"
			, "0.4 1 0"
			, "0.2 1 0"
			, "0 1 0"
			, "0 1 0.2"
			, "0 1 0.4"
			, "0 1 0.6"
			, "0 1 0.8"
			, "0.00784313725490196 1 1"
			, "0.011764705882352941 0.8 1"
			, "0.0196078431372549 0.6 1"
			, "0.0196078431372549 0.4 1"
			, "0.023529411764705882 0.2 1"
			, "0.023529411764705882 0 1"
			, "0.2 0 1"
			, "0.4 0 1"
			, "0.6 0 1"
			, "0.8 0 1"
			, "1 0 1"
			, "1 0 0.8"
			, "1 0.00784313725490196 0.6"
			, "1 0.011764705882352941 0.4"
			, "1 0.01568627450980392 0.2"];

		this.munsellValues = ["0.8156862745098039 0 0.5058823529411764",
			"0.8862745098039215 0 0.39215686274509803",
			"0.9490196078431372 0 0.23529411764705882",
			"0.9725490196078431 0.34901960784313724 0",
			"0.9490196078431372 0.5333333333333333 0",
			"0.9490196078431372 0.6705882352941176 0",
			"0.9372549019607843 0.8 0",
			"0.9411764705882353 0.9176470588235294 0",
			"0.6941176470588235 0.8431372549019608 0",
			"0 0.792156862745098 0.1411764705882353",
			"0 0.6588235294117647 0.4666666666666667",
			"0 0.6549019607843137 0.5411764705882353",
			"0 0.6470588235294118 0.611764705882353",
			"0 0.6392156862745098 0.6745098039215687",
			"0 0.5764705882352941 0.6862745098039216",
			"0 0.5098039215686274 0.6980392156862745",
			"0 0.43137254901960786 0.7490196078431373",
			"0.49019607843137253 0 0.9725490196078431",
			"0.6235294117647059 0 0.7725490196078432",
			"0.7254901960784313 0 0.6509803921568628"];

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
	initialize(cSpace) {
		switch (cSpace) {
			// ---- RGB
			case 'newton':
				for (var i = 0; i < this.newtonValues.length; i++) {
					var tmp = this.newtonValues[i].split(' ');
					this.colors.push({ name: i, chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				break;
			// ---- RGB INVERTED
			case 'newtonInverted':
				for (var i = 0; i < this.newtonValues.length; i++) {
					var tmp = this.newtonValues[i].split(' ');
					this.colors.push({ name: i, chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				this.colors.reverse();
				break;
			// ---- MUNSELL
			case 'munsell':
				//let munsellNames=["cGR","dGR","	*cGR","dR","cR","dRVi","cRVi","dVi","cVi","dViA","cViA","dA","cA","dAV","cAV","dV","cV","dVG","cVG","dG"]
				let munsellNames = ['5RP', '10RP', '5R', '10R', '5YR', '10YR', '5Y', '10Y', '5GY', '10GY', '5G', '10G', '5GB', '10BG', '5B', '10B', '5PB', '10PB', '5P', '10P']

				for (var i = this.munsellValues.length - 1; i >= 0; i--) {
					var tmp = this.munsellValues[i].split(' ');
					this.colors.push({ name: munsellNames[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				break;
			// ---- MUNSELL INVERTED
			case 'munsellInverted':
				//let munsellNames2=["cGR","dGR","	*cGR","dR","cR","dRVi","cRVi","dVi","cVi","dViA","cViA","dA","cA","dAV","cAV","dV","cV","dVG","cVG","dG"]
				let munsellNames2 = ['5RP', '10RP', '5R', '10R', '5YR', '10YR', '5Y', '10Y', '5GY', '10GY', '5G', '10G', '5GB', '10BG', '5B', '10B', '5PB', '10PB', '5P', '10P']

				for (var i = this.munsellValues.length - 1; i >= 0; i--) {
					var tmp = this.munsellValues[i].split(' ');
					this.colors.push({ name: munsellNames2[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				this.colors.reverse();
				break;
			// ---- SECONDARY
			case 'secondary':
				let secondaryNames = ['red', 'org', 'yel', 'gre', 'blu', 'pur'];

				for (var i = 0; i < this.secondaryValues.length; i++) {
					var tmp = this.secondaryValues[i].split(' ');
					this.colors.push({ name: secondaryNames[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				break;
			// ---- SECONDARY INVERTED
			case 'secondaryInverted':
				let secondaryNames2 = ['red', 'org', 'yel', 'gre', 'blu', 'pur'];

				for (var i = 0; i < this.secondaryValues.length; i++) {
					var tmp = this.secondaryValues[i].split(' ');
					this.colors.push({ name: secondaryNames2[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				this.colors.reverse();
				break;
			// ---- BINARY TEST
			case 'test':
				let test = ['red', 'gre', 'pur'];

				for (var i = 0; i < this.test.length; i++) {
					var tmp = this.test[i].split(' ');
					this.colors.push({ name: test[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				break;
			// ---- BINARY TEST INVERTED
			case 'testInverted':
				let test2 = ['red', 'gre', 'pur'];

				for (var i = 0; i < this.test.length; i++) {
					var tmp = this.test[i].split(' ');
					this.colors.push({ name: test2[i], chroma: chroma(tmp[0] * 255, tmp[1] * 255, tmp[2] * 255) });
				}
				this.colors.reverse();
				break;
		}
	}

	getAll() {
		return this.colors;
	}

	/**
	* Gets an array of 20 ordered colors in Munsell color space
	* @return {Array} 20 ordered colors in Munsell color space
	*/
	getMunsell() {
		initialize('munsell');
		return this.colors;
	}

	/**
	* Gests and array of 20 ordered colors in Newtonean color space
	* @return {Array} 20 ordered colors in Newtonean color space
	*/
	getNewton() {
		initialize('newton');
		return this.colors;
	}

}
