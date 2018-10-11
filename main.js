"use strict";

var input = "./data/";
var output = "./output/";
var resolution = 256;
var repetions = 10;
var drawImages = false;
var near = 0.3;
var far = 2.0;
var fov = 60.0;
var distance = 1.2;

var fs = require("fs");
var gui = require("nw.gui");

var canvas, renderer, camera;

document.body.onload = function()
{
	createRenderer();

	var files = fs.readdirSync(input);

	for(var i = 0; i < files.length; i++)
	{
		for(var j = 0; j < repetions; j++)
		{
			viewModel(files[i], i, j);
		}
	}

	if(!drawImages)
	{
		exit();
	}
};

function createRenderer()
{
	canvas = document.createElement("canvas");
	canvas.style.width = resolution + "px";
	canvas.style.height = resolution + "px";
	canvas.width = resolution;
	canvas.height = resolution;

	renderer = new THREE.WebGLRenderer(
	{
		canvas: canvas,
		alpha: false,
		logarithmicDepthBuffer: false,
		context: null,
		precision: "highp",
		premultipliedAlpha: true,
		antialias: true,
		preserveDrawingBuffer: true,
		powerPreference: "high-performance"
	});

	camera = new THREE.PerspectiveCamera(fov, 1, near, far);
	camera.position.z = distance;
	camera.updateProjectionMatrix();
}

function viewModel(fname, index, repetion)
{
	if(repetion === undefined)
	{
		repetion = 0;
	}

	var scene = new THREE.Scene();

	var object = loadModel(input + fname);
	scene.add(object);

	renderer.setSize(resolution, resolution, false);
	renderer.render(scene, camera);

	var data = canvas.toDataURL();

	if(drawImages)
	{
		var img = document.createElement("img");
		img.src = data;
		document.body.appendChild(img);
	}

	writeFileBase64(output + index + "_" + repetion + ".png", data);
}

function writeFileBase64(fname, data)
{
	var buffer = Buffer.from(data.slice(data.search(";base64,") + 8), "base64");

	fs.writeFileSync(fname, buffer);
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
		object.position.set(-center.x, -center.y, -center.z);
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

			var boundingBox = children.geometry.boundingBox.clone();
			boundingBox.applyMatrix4(children.matrixWorld);

			if(box === null)
			{
				box = boundingBox;
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

	obj.rotation.set(Math.random() * Math.PI* 2, Math.random() * Math.PI* 2, Math.random() * Math.PI* 2);
	obj.updateMatrix();
	obj.updateMatrixWorld(true);

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
