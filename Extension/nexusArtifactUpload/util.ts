/// <reference path="../../node_modules/@types/node/index.d.ts"/>
/// <reference path="../../node_modules/vsts-task-lib/task.d.ts" />
import cheerio = require('cheerio')
import fs = require('fs');
import path = require('path');
import * as tl from 'vsts-task-lib';

function startsWith(baseStr: string, str: string): boolean {
    return baseStr.indexOf(str) == 0;
}

function endsWith(baseStr: string, str: string): boolean {
    return baseStr.slice(-str.length) == str;
}

export function addUrlSegment(baseUrl: string, segment: string): string {
    var resultUrl = null;
    if (endsWith(baseUrl, '/') && startsWith(segment, '/')) {
        resultUrl = baseUrl + segment.slice(1);
    } else if (endsWith(baseUrl, '/') || startsWith(segment, '/')) {
        resultUrl = baseUrl + segment;
    } else {
        resultUrl = baseUrl + '/' + segment;
    }
    return resultUrl;
}

export interface ArtifactInfo {
	artifactId: string;
	artifactVersion: string;
	specFileName: string;
	fileName: string;
	packaging: string;
	extension: string;
}

export function verifySupportedType(packageType: string) {
	switch (packageType.toLowerCase()) {
		case "nuget": return;
		default:
			throw new RangeError("Unsupported packageType: " + packageType);
	}
}

function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof(obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}

export function getSpecFiles(basePath: string, packageType: string): string[] {
	verifySupportedType(packageType);
	switch (packageType.toLowerCase()) {
		case "nuget": return tl.findMatch(basePath, '**/*.nuspec');
	}
}

export function getPackageFiles(basePath: string, packageType: string): string[] {
	verifySupportedType(packageType);
	switch (packageType.toLowerCase()) {
		case "nuget": return tl.findMatch(basePath, '**/*.nupkg');
	}
}

export function getArtifacts(specFiles : string[], packageFiles : string[]): ArtifactInfo[] {
	let result = [];
	let findPackageFileBySpec = function (specFile: string) : string {
		let specFileBase = path.basename(specFile, path.extname(specFile));
		for (let packageFile of packageFiles) {
			let packageFileBase = path.basename(packageFile, path.extname(packageFile));
			console.log('packageFileBase : ' + packageFileBase);
			if (packageFileBase === specFileBase)
				return packageFile;
		}
		throw new RangeError("Unable to match passed in specFile " + specFile + " with packageFile list: " + packageFiles.join(","));
	}
	
	specFiles.forEach(function (specFile) {
		let specFileData = fs.readFileSync(specFile);
		let xml = cheerio.load(specFileData, { xmlMode: true });
		let packageFile = findPackageFileBySpec(specFile);
		result.push({
			artifactId : xml('package metadata id').text(),
			artifactVersion: xml('package metadata version').text(),
			specFileName: specFile,
			fileName: packageFile,
			packaging: path.extname(packageFile),
			extension: path.extname(packageFile)
		});
	});

	return result;
}

/*
Gets the value of the string, but with the vsts task library variable call made on each variable
*/
export function getParsedString(input: string): string {
	var regEx = /\$\(([^)]*)\)/g;
	return input.replace(regEx, function (match, capture) { 
		return tl.getVariable(capture);
	});
}