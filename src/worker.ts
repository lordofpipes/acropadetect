import { parseImage } from "./detect";

self.onmessage = async (e) => {
    const data = e.data;

    for (const [id, image] of data) {
        self.postMessage({
            type: "working",
            id,
        });
        await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(image);
            reader.addEventListener("error", (err) => reject(err));
            reader.addEventListener("load", () => {
                try {
                    const result = parseImage(reader.result);
                    self.postMessage({
                        type: "result",
                        id,
                        result,
                    });
                } catch (err) {
                    self.postMessage({
                        type: "error",
                        id,
                        error: err,
                    });
                } finally {
                    resolve(void 0);
                }
            });
        });
    }
};
