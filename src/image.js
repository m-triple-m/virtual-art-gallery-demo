'strict mode';

const api = require('../api/api');
const selectedApi = new URLSearchParams(window.location.search).get("api");
const dataAccess = api[selectedApi] || api[api.default];
const text = require('./text');

const imageList = [
	{title: 'example 1', path: 'img1.jpg'},
	{title: 'example 3', path: 'img3.jpg'},
	{title: 'example 4', path: 'img4.jpg'},
	{title: 'example 5', path: 'img5.jpg'},
	{title: 'example 6', path: 'img6.jpg'},
	{title: 'example 7', path: 'img7.jpg'},
	{title: 'example 8', path: 'pic1.jpg'},
	{title: 'example 9', path: 'pic2.jpg'},
	{title: 'example 10', path: 'pic3.jpg'},
	{title: 'example 11', path: 'pic4.jpg'},
	{title: 'example 12', path: 'pic5.jpg'},
	{title: 'example 13', path: 'pic6.jpg'},
	{title: 'example 14', path: 'pic7.jpg'},
	{title: 'example 15', path: 'pic8.jpg'},
	{title: 'example 16', path: 'pic9.jpg'},
	{title: 'example 17', path: 'pic10.jpg'},
	{title: 'example 18', path: 'pic11.jpg'},
	{title: 'example 19', path: 'pic12.jpg'},
	{title: 'example 20', path: 'pic13.jpg'},
	{title: 'example 21', path: 'pic14.jpg'},
	{title: 'example 22', path: 'pic15.jpg'},
	{title: 'example 23', path: 'pic16.jpg'},
	{title: 'example 24', path: 'pic17.jpg'},
	{title: 'example 25', path: 'pic18.jpg'},
	{title: 'example 26', path: 'pic19.jpg'},
	{title: 'example 27', path: 'pic20.jpg'},
	{title: 'example 28', path: 'pic21.jpg'}


]


let paintingCache = {};
let unusedTextures = [];

const loadLocalImage = async (path, cb) => {

	const res = await fetch(path);
	const blobImg = await res.blob();
	return blobImg;
	// .then(async(res) => {
	// 	let blob = 
	// 	// console.log(blob);
	// 	return blob
	// }).catch((err) => {
	// 	console.log(err);
	// });
	return;
	// Create an XMLHttpRequest object
	var xhr = new XMLHttpRequest();

	// Set the responseType to 'blob'
	xhr.responseType = 'blob';

	// Open the connection
	xhr.open('GET', path, false);

	
	// When the request is loaded
	// xhr.onload = function() {
	// // If the request was successful
	
	// };

	// Send the request
	xhr.send(null);

	if (xhr.status === 200) {
		// Create a new blob object from the response
		var blob = new Blob([xhr.response], {type: 'image/jpeg'});
		cb(blob);
		console.log(blob);
		// Create a URL for the blob object
		// var url = URL.createObjectURL(blob);

		// Create an image element and set its src attribute to the blob URL
		// var img = new Image();
		// img.src = url;

		// Add the image element to the document
		// document.body.appendChild(img);
	}

}

const dynamicQualThreshold = 2;
function dynamicQual(quality) {
	if(!navigator.connection || navigator.connection.downlink < dynamicQualThreshold) {
		quality = (quality == 'high') ? 'mid' : 'low';
	}
	return quality;
}

const resizeCanvas = document.createElement('canvas');
resizeCanvas.width = resizeCanvas.height = 2048;
const ctx = resizeCanvas.getContext('2d');
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
let aniso = false;

const emptyImage = (regl) => [
	(unusedTextures.pop() || regl.texture)([[[200, 200, 200]]]),
	_=>(unusedTextures.pop() || regl.texture)([[[0, 0, 0, 0]]]),
	1
];

async function loadImageCustom(regl, {path, title}){
	let image;
	try {
		// const data = await dataAccess.fetchImage(p, dynamicQual(res));
		// console.log(data);
		// let img = await loadLocalImage('../res/images/img1.jpg');
		let img = await loadLocalImage(`../res/images/${path}`);
		image = await createImageBitmap(img);
		console.log(image);
		// title = title;
		// Resize image to a power of 2 to use mipmap (faster than createImageBitmap resizing)
		// image = await createImageBitmap(data.image);
		ctx.drawImage(image, 0, 0, resizeCanvas.width, resizeCanvas.height);
	} catch(e) {
		// Try again with a lower resolution, otherwise return an empty image
		console.error(e);
		// return res == "high" ? await loadImage(regl, p, "low") : emptyImage(regl);
		return emptyImage(regl);
	}

	return [(unusedTextures.pop() || regl.texture)({
			data: resizeCanvas,
			min: 'mipmap',
			mipmap: 'nice',
			aniso,
			flipY: true
		}),
		width=>text.init((unusedTextures.pop() || regl.texture), title, width),
		image.width / image.height
	];
}

async function loadImage(regl, p, res) {
	if (aniso === false) {
		aniso = regl.hasExtension('EXT_texture_filter_anisotropic') ? regl._gl.getParameter(
			regl._gl.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT
		) : 0;
		console.log(aniso);
	}
	
	let image, title;
	try {
		const data = await dataAccess.fetchImage(p, dynamicQual(res));
		// console.log(data);
		let img = await loadLocalImage('../res/images/img1.jpg');
		image = await createImageBitmap(img);
		console.log(image);
		title = data.title;
		// Resize image to a power of 2 to use mipmap (faster than createImageBitmap resizing)
		// image = await createImageBitmap(data.image);
		ctx.drawImage(image, 0, 0, resizeCanvas.width, resizeCanvas.height);
	} catch(e) {
		// Try again with a lower resolution, otherwise return an empty image
		console.error(e);
		return res == "high" ? await loadImage(regl, p, "low") : emptyImage(regl);
	}

	return [(unusedTextures.pop() || regl.texture)({
			data: resizeCanvas,
			min: 'mipmap',
			mipmap: 'nice',
			aniso,
			flipY: true
		}),
		width=>text.init((unusedTextures.pop() || regl.texture), title, width),
		image.width / image.height
	];
}

module.exports = {
	fetch: (regl, count = 10, res = "low", cbOne, cbAll) => {
		const from = Object.keys(paintingCache).length;
		imageList.map(p => {
			console.log(p);
			// if (paintingCache[p.image_id]) {
			// 	if (--count === 0)
			// 		cbAll();
			// 	return;
			// }
			paintingCache[p.image_id] = p;
			loadImageCustom(regl, p, res).then(([tex, textGen, aspect]) => {
				cbOne({ ...p, tex, textGen, aspect });
				if (--count === 0)
					cbAll();
			});
		})
		// dataAccess.fetchList(from, count).then(paintings => {
		// 	console.log(paintings);
		// 	count = paintings.length;
			// code was here
		// });
	},
	load: (regl, p, res = "low") => {
		if (p.tex || p.loading)
			return;
		p.loading = true;
		loadImage(regl, p, res).then(([tex, text]) => {
			p.loading = false;
			p.tex = tex;
			p.text = text;
		});
	},
	unload: (p) => {
		if (p.tex) {
			unusedTextures.push(p.tex);
			p.tex = undefined;
		}
		if (p.text) {
			unusedTextures.push(p.text);
			p.text = undefined;
		}
	}
};