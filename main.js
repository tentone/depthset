"use strict";

var input = "./data/";
var output = "./output";
var resolution = 512;

var fs = require("fs");
var gui = require("nw.gui");

var files = fs.readdirSync(input);
for(var i = 0; i < files.length; i++)
{
	console.log(files[i]);
}

function loadModel(file)
{
	if(file.endsWith(".obj"))
	{
		//TODO <TEXT DATA>
		var loader = new THREE.OBJLoader();
		var obj = loader.parse(reader.result);
		obj.name = FileSystem.getFileName(name);
	}
	else if(file.endsWith(".stl"))
	{
		var loader = new THREE.STLLoader();
		var geometry = loader.parse(reader.result);
		var obj = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
	}

	//TODO <ADD CODE HERE>
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
