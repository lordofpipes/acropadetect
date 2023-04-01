import * as fs from "node:fs";

async function build() {
    try {
        await fs.promises.mkdir("vendor");
    } catch (err) {
        if (err.errno !== -17) {
            throw err;
        }
    }
    fs.createReadStream("./node_modules/@zip.js/zip.js/dist/zip.js").pipe(fs.createWriteStream("vendor/zip.js"));
    fs.createReadStream("./node_modules/@picocss/pico/css/pico.css").pipe(fs.createWriteStream("vendor/pico.css"));
}
build();
