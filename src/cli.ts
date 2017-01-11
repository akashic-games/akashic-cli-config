import * as fs from "fs";
import * as path from "path";
import * as commander from "commander";
import { ConsoleLogger } from "@akashic/akashic-cli-commons";
import * as config from "./config";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));

commander
	.description("List and edit configurations")
	.version(packageJson.version)
	.usage("<command> [argument]")
	.option("-a, --all", "List all items");

export function run(argv: string[]): void {
	commander.parse(argv);
	const logger = new ConsoleLogger();
	let command: Promise<void>;
	switch (commander.args[0]) {
		case "get":
			// TODO: validatorをakashicコマンドから引き渡す方法の検討と実装
			command = config.getConfigItem(null, commander.args[1])
				.then(value => logger.print(value));
			break;
		case "set":
			command = config.setConfigItem(null, commander.args[1], commander.args[2]);
			break;
		case "delete":
			command = config.deleteConfigItem(null, commander.args[1]);
			break;
		case "list":
			if ((<any>commander).all != null) {
				command = config.listAllConfigItems(logger, null);
			} else {
				command = config.listConfigItems(logger);
			}
			break;
		default:
			command = Promise.reject("unknown command \"" + commander.args[0] + "\"");
			break;
	}
	command
		.catch(err => {
			logger.error(err);
			process.exit(1);
		});
}
