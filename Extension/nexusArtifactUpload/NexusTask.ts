// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/// <reference path="../../node_modules/@types/node/index.d.ts"/>
/// <reference path="../../node_modules/vsts-task-lib/task.d.ts" />

import Q = require('q');
import * as tl from 'vsts-task-lib';
import fs = require('fs');

import * as Util from './util';

// node js modules
var request = require('request');

//server & auth
var serverEndpoint = tl.getInput('serverEndpoint', true);
var serverEndpointUrl = tl.getEndpointUrl(serverEndpoint, false);
tl.debug('serverEndpointUrl=' + serverEndpointUrl);
var serverEndpointAuth = tl.getEndpointAuthorization(serverEndpoint, false);
var username = serverEndpointAuth['parameters']['username'];
var password = serverEndpointAuth['parameters']['password'];

var serviceUrlFragment = tl.getInput('serviceUrlFragment', true);
var nexusUploadUrl = Util.addUrlSegment(serverEndpointUrl, serviceUrlFragment);
tl.debug('nexusUploadUrl=' + nexusUploadUrl);

//other options
var repositoryId = tl.getInput('repositoryId', true);
var groupId = tl.getInput('groupId', true);
var packageType = tl.getInput('packageType', true);
var basePath = tl.getInput('basePath', false);
if (!basePath) {
	tl.debug('basePath not defined, falling back to agent.builddirectory');
	basePath = tl.getVariable('agent.builddirectory')
} else {
	basePath = Util.getParsedString(basePath);
}
var classifier = tl.getInput('classifier', false);
if (!classifier) {
    tl.debug('classifier not specified');
    classifier = '';
}
var trustSSL = tl.getInput('trustSSL', true);
let specFiles = Util.getSpecFiles(basePath, packageType);
let packageFiles = Util.getPackageFiles(basePath, packageType);
let artifacts = Util.getArtifacts(specFiles, packageFiles);

if (artifacts.length == 0) {
    var message = 'No artifacts found to upload';
    tl.setResult(tl.TaskResult.SucceededWithIssues, message);
}

function dotnetNuGetPush(artifact: Util.ArtifactInfo): Q.Promise<number> {
	return tl.exec('dotnet', ['nuget', 'push', artifact.fileName, '-s', nexusUploadUrl, '-k', password]);
}

let promises = [];
artifacts.forEach(function(artifact) {
        promises.push(dotnetNuGetPush(artifact));
});
Q.allSettled(promises)
	.fail(error => {
		var message = 'Upload to NuGet repository failed: ' + error.message;
		tl.setResult(tl.TaskResult.Failed, message);
	});
