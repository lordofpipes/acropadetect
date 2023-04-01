import * as fs from "node:fs";
import { join } from "node:path";
import { parseImage, toArrayBuffer } from "./detect.js";

async function scanFolder() {
    for (let filename of await fs.promises.readdir(process.argv[2])) {
        try {
            const result = parseImage(toArrayBuffer(await fs.promises.readFile(join(process.argv[2], filename))));
            if (result) console.log(filename);
        } catch (err) {
            console.error(err);
        }
    }
}
scanFolder();
