"use strict";

var input = "./data/";

var fs = require("fs");
var files = fs.readdirSync(input);

for(var i = 0; i < files.length; i++)
{
	console.log(files[i]);
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
