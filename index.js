var chrome = require("./src/chrome.js");
var imgCompare = require("./src/imgCompare.js");
var sleep = require("sleep");
var path = require("path");
var fs = require("fs");

var folderPrefix = "uitest_";

/*
confObj
{
	url;default url to open at init
	ci_url;default url to open when running in ci
	mode;null for reference mode,test for test mode
	script;script to execute to retrive list of urls
	ip;ip address of the browser to run in default
	ci_ip;ip address of the browser to if run in ci
	folderPrefix;prefix for thr folder when creating screenshots
}
*/

const run = function(confObj) {
	var url = confObj.url;
	if (process.env.CI_BUILD_ID != undefined) {
		url = confObj.ci_url;
	}
	if (confObj.folderPrefix != undefined) {
		folderPrefix = confObj.folderPrefix;
	}
	var isTest = (confObj.mode == "test");
	var folderName = isTest ? folderPrefix+"test" : folderPrefix+"reference";

	chrome.init(confObj);
	var driver = chrome.getBrowser(url);
	chrome.executeScript(driver,confObj.script).then(function (urls) {
		for (var i=0;i<urls.length;i++) {
			chrome.openUrl(driver,urls[i]);
			var fileName = urls[i].split("?")[1];
			chrome.takeScreenshot(driver,folderName,fileName)
		}
		driver.quit().then(function () {
			if (isTest) {
				test();
			}
		});
	})
}
const test = function () {
	var testFolderName = process.env.PWD+path.sep+folderPrefix+"test";
	var refFolderName = process.env.PWD+path.sep+folderPrefix+"reference";
	var diffFolderName = process.env.PWD+path.sep+folderPrefix+"diff";

	var allFile = fs.readdirSync(testFolderName);
	var tmpRes = [];
	var newlyAddedFiles = [];
	var testRes = allFile.map(function (i,j) {
		if (fs.existsSync(refFolderName+path.sep+i)) {
			var res = imgCompare.getDiff(testFolderName+path.sep+i,refFolderName+path.sep+i,diffFolderName+path.sep+i,tmpRes);
		}
		else {
			newlyAddedFiles.push(refFolderName+path.sep+i);
		}
	})
	var interval = null;
	interval = setInterval(function () {
		if (allFile.length == tmpRes.length) {
			console.log("IntervalCleared...",tmpRes);
			clearInterval(interval);
		}
	},1000)
}

module.exports = {
	run
}

