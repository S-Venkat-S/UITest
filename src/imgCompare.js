var imageDiff = require("image-diff");
var chalk = require("chalk");
var base64Img = require('base64-img');
// var imageDiff = require("node-resemble");



const getDiff = function(mainFile, testFile, diffFile,res) {

    var options = {
        actualImage: mainFile,
        expectedImage: testFile,
        diffImage: diffFile
    }
    var differ = new imageDiff.ImageDiff();
    differ.fullDiff(options, function (err,result) {
    		res.push(result);
		if (err) {
			console.log(chalk.red(err))
			return false;
		}
		if (result.percentage) {
			console.log(base64Img.base64Sync(mainFile));
			console.log("\n\n\n");
			console.log(base64Img.base64Sync(testFile));
			console.log("\n\n\n");
			console.log(base64Img.base64Sync(diffFile));
			console.log("\n\n\n");
			console.log(chalk.red.bold("\u2715 : "+testFile),"\n\t",result);
			return false;
		}
		console.log(chalk.green.bold("\u2714 : "+testFile))
		return true;
	});
}

module.exports = { getDiff };
