var chrome = require("./src/chrome.js");
var imgCompare = require("./src/imgCompare.js");
var sleep = require("sleep");
var path = require("path");
var fs = require("fs");
var args = process.argv.splice(2);

const run = function() {
	var urlExtn = "http://venkat-zt74:8000/build/DocumentationPage.html";

	if (process.env.CI_BUILD_ID != undefined) {
		urlExtn = "http://tsi-desk-u14:8080/React_Coverage/"+process.env.CI_BUILD_ID+"_docs/DocumentationPage.html"
	}

	var isTest = (args[0] == "test");
	var folderName = isTest ? "test" : "reference";

	var urls = [urlExtn+"?dashboard__AgentsListComponents"];

	var driver = chrome.getBrowser("http://tsi-desk-u14:8080/");
	for (var i=0;i<urls.length;i++) {
		console.log(urls[i],"----->>>>---->>>>")
		chrome.openUrl(driver,urls[i]);
		var fileName = urls[i].split("?")[1];
		chrome.takeScreenshot(driver,folderName,fileName)
	}

	driver.quit().then(function () {
		if (isTest) {
			test();
		}
	});
}
const test = function () {
	var testFolderName = process.env.PWD+path.sep+"test";
	var refFolderName = process.env.PWD+path.sep+"reference";
	var diffFolderName = process.env.PWD+path.sep+"diff";

	var allFile = fs.readdirSync(process.env.PWD+path.sep+"test");
	var tmpRes = [];
	var testRes = allFile.map(function (i,j) {
		var res = imgCompare.getDiff(testFolderName+path.sep+i,refFolderName+path.sep+i,diffFolderName+path.sep+i,tmpRes);
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