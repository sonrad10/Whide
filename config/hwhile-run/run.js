const { HWhileConnector } = require("@whide/hwhile-wrapper");

module.exports.name = "run_code";
module.exports.args = [
	{
		name: "path",
		description: "File to execute",
		type: 'file',
	},
];

module.exports.run = async function({ args, ioController, runPanelController, path }) {
	const filePath = args["path"];

	let expr = await ioController.getInput({
		message: "Expression to pass as input to the program",
		title: "Argument expression",
	});

	//User pressed cancel Run
	if (!expr) return;

	const file_name = path.basename(filePath);
	const folder_path = path.dirname(filePath);
	const hWhileConnector = new HWhileConnector({
		hwhile: "hwhile",
		cwd: folder_path,
	});

	let instanceController = await runPanelController.addOutputStream(file_name);

	let shell = hWhileConnector.run(file_name, expr, false);

	shell.stdout.on("data", data => instanceController.stream.write(data.toString()));
	shell.on('error', error => console.log(` error: ${error.message}`));
	shell.on("close", code => console.log(`child process exited with code ${code}`));
}