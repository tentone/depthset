"use strict";

var input = "./data/";
var output = "./output";
var resolution = 256;

var fs = require("fs");
var gui = require("nw.gui");

document.body.onload = function()
{
	var files = fs.readdirSync(input);

	for(var i = 0; i < files.length; i++)
	{
		viewModel(input + files[i]);
		break;
	}
};

function viewModel(fname)
{
	var canvas = document.createElement("canvas");
	canvas.style.position = "absolute";
	canvas.style.top = "0px";
	canvas.style.left = "0px";
	canvas.style.width = resolution + "px";
	canvas.style.height = resolution + "px";
	canvas.width = resolution;
	canvas.height = resolution;
	document.body.appendChild(canvas);

	var renderer = new THREE.WebGLRenderer(
	{
		canvas: canvas,
		alpha: true,
		logarithmicDepthBuffer: false,
		context: null,
		precision: "highp",
		premultipliedAlpha: true,
		antialias: true,
		preserveDrawingBuffer: false,
		powerPreference: "high-performance"
	});

	var camera = new THREE.PerspectiveCamera(60, 1, 0, 1);

	var scene = new THREE.Scene();

	var object = loadModel(fname);
	object.position.z = -0.5;
	scene.add(object);

	renderer.render(camera, scene);
}

function scaleAndCenterObject(object)
{
	var box = calculateBoundingBox(object);
	
	if(box !== null)
	{
		var size = new THREE.Vector3();
		box.getSize(size);

		var scale = 1 / (size.x > size.y ? size.x > size.z ? size.x : size.z : size.y > size.z ? size.y : size.z);
		
		var center = new THREE.Vector3();
		box.getCenter(center);
		center.multiplyScalar(scale);

		object.scale.set(scale, scale, scale);
		object.position.set(-center.x, -scale * box.min.y, -center.z);
	}
};

function calculateBoundingBox(object)
{
	var box = null;

	object.traverse(function(children)
	{
		if(children.geometry !== undefined)
		{
			children.geometry.computeBoundingBox();
			var boundingBox = children.geometry.boundingBox;

			if(box === null)
			{
				box = boundingBox.clone();
			}
			//Ajust box size
			else
			{
				if(boundingBox.min.x < box.min.x) {box.min.x = boundingBox.min.x;}
				if(boundingBox.max.x > box.max.x) {box.max.x = boundingBox.max.x;}
				if(boundingBox.min.y < box.min.y) {box.min.y = boundingBox.min.y;}
				if(boundingBox.max.y > box.max.y) {box.max.y = boundingBox.max.y;}
				if(boundingBox.min.z < box.min.z) {box.min.z = boundingBox.min.z;}
				if(boundingBox.max.z > box.max.z) {box.max.z = boundingBox.max.z;}
			}
		}
	});

	return box;
};

function loadModel(fname)
{
	var obj = null;

	if(fname.endsWith(".obj"))
	{
		var loader = new THREE.OBJLoader();
		obj = loader.parse(readFileText(fname));

		obj.traverse(function(children)
		{
			if(children.material !== undefined)
			{
				children.material = new THREE.MeshDepthMaterial();
			}
		});
	}
	else if(fname.endsWith(".stl"))
	{
		var loader = new THREE.STLLoader();
		var geometry = loader.parse(readFileArrayBuffer(fname));
		obj = new THREE.Mesh(geometry, new THREE.MeshDepthMaterial());
	}

	scaleAndCenterObject(obj);

	return obj;
}

function readFileText(fname)
{
	return fs.readFileSync(fname, "utf8");
}

function readFileArrayBuffer(fname)
{
	var buffer = fs.readFileSync(fname);
	var length = buffer.length;
	var array = new ArrayBuffer(length);
	var view = new Uint8Array(array);

	for(var i = 0; i < length; i++)
	{
		view[i] = buffer[i];
	}

	return array;
}

function exit()
{
	var win = gui.Window.get();
	gui.App.closeAllWindows();
	win.close(true);
	gui.App.quit();
}

function writeFile(arraybuffer, fname)
{
	var buffer = fromArrayBuffer(arraybuffer);
	var stream = fs.createWriteStream(fname);
	stream.write(buffer);
	stream.end();
}

function fromArrayBuffer(array)
{
	var buffer = new Buffer(array.byteLength);
	var view = new Uint8Array(array);
	
	for(var i = 0; i < buffer.length; i++)
	{
		buffer[i] = view[i];
	}

	return buffer;
}
