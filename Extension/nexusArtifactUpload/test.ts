import fs = require('fs');
import path = require('path');
import * as Util from './util';
var tl = require("vsts-task-lib");

let basePath = '/mnt/c/Code/Sprinkler/';
tl.setVariable('agent.builddirectory', basePath);
console.log(tl.getVariable('$(agent.builddirectory)'));
//let basePath = 'C:\\Code\\Sprinkler\\';
let packageType = 'NuGet';
/*
let specFiles = Util.getSpecFiles(basePath, packageType);
let packageFiles = Util.getPackageFiles(basePath, packageType);

console.log('Calling Util.getArtifacts with: [' + specFiles.join(',') + '], [' + packageFiles.join(',') + ']');
let artifacts = Util.getArtifacts(specFiles, packageFiles);
console.log('Found ' + artifacts.length + ' artifacts');
artifacts.forEach(function(artifact) {
	console.log('Found artifact: ');
	console.log(artifact);
});*/
/*
let getFolders = function(rootdir : string): string[] {
	let results = [];

	let files = fs.readdirSync(rootdir);
	let getSubFolders = function (filesOrFolders: string[]): string[] {
		return filesOrFolders.filter(file => {
			let filepath = path.join(rootdir, file);
			let stat = fs.statSync(filepath);
			return stat.isDirectory();
		}).map(file => path.join(rootdir, file));
	}
	results = getSubFolders(files);
	results.map(getFolders).forEach(subFolders => results = results.concat(subFolders));
	return results;
};
getFolders('_temp')
.filter(f => {
	return path.basename(f) == 'node_modules'
		&& !(path.dirname(f).indexOf('node_modules') > -1)
})
.forEach(f => {
	console.log(f);
});*/