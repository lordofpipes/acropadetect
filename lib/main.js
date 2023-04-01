const switchTheme = document.getElementById("theme-switcher");
const lightMode = switchTheme.querySelector(".light-mode");
const darkMode = switchTheme.querySelector(".dark-mode");
let isLight = !(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    switchTheme.querySelector(".os-default").style.display = "none";
    darkMode.style.display = isLight ? "none" : "inline";
    lightMode.style.display = isLight ? "inline" : "none";
    switchTheme.setAttribute("data-tooltip", isLight ? "light" : "dark");
});
function toggleTheme() {
    isLight = !isLight;
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    darkMode.style.display = isLight ? "none" : "inline";
    lightMode.style.display = isLight ? "inline" : "none";
    switchTheme.setAttribute("data-tooltip", isLight ? "light" : "dark");
}
switchTheme.addEventListener("click", (e) => {
    e.preventDefault();
    toggleTheme();
});
const input = document.querySelector("input[type='file']");
const workerCountPicker = document.getElementById("threads-picker");
const thresholdPicker = document.getElementById("threshold-picker");
const resultsFooter = document.getElementById("results-footer");
const progressBar = resultsFooter.querySelector(".progress");
const currentlyProcessing = resultsFooter.querySelector(".currently-processing");
const resultSummary = document.getElementById("output");
const resultText = resultSummary.querySelector(".output-text");
const resultCode = resultSummary.querySelector(".output-code");
const resultPanel = document.getElementById("images");
function chunks(array, parts) {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
}
let neededResults = 0;
const results = [];
input.addEventListener("change", () => {
    input.disabled = true;
    const workerCount = parseInt(workerCountPicker.value);
    const threshold = thresholdPicker.value;
    const workers = [];
    const files = {};
    for (const file of input.files) {
        files[file.name] = file;
    }
    const workingFiles = chunks(Object.entries(files), workerCount);
    const processingMessages = {};
    resultsFooter.style.display = "block";
    resultsFooter.scrollIntoView();
    resultsFooter.focus();
    resultPanel.style.display = "block";
    neededResults += input.files.length;
    for (let n = 0; n < workerCount; ++n) {
        const worker = new Worker("lib/dist/worker.js");
        workers.push(worker);
        worker.postMessage(workingFiles[n]);
        worker.addEventListener("message", (e) => {
            const data = e.data;
            switch (data.type) {
                case "debug":
                    break;
                case "error":
                case "result":
                    if (data.type === "error" || data.result >= threshold) {
                        const article = document.createElement("article");
                        const header = document.createElement("header");
                        const filename = document.createElement("strong");
                        filename.innerText = data.id;
                        header.appendChild(filename);
                        header.appendChild(document.createElement("br"));
                        if (data.type === "error")
                            header.appendChild(document.createTextNode(`Unknown result. File parse error: ${data.error}`));
                        else
                            header.appendChild(document.createTextNode(`Vulnerable! Has ${(data.result / 1024).toFixed(1)} KiB more than it should`));
                        article.appendChild(header);
                        const img = document.createElement("img");
                        img.setAttribute("src", URL.createObjectURL(files[data.id]));
                        img.setAttribute("alt", data.id);
                        article.appendChild(img);
                        resultPanel.append(article);
                    }
                    processingMessages[data.id].remove();
                    results.push([data.id, data.result]);
                    progressBar.value = (100 * results.length) / neededResults;
                    if (results.length === neededResults) {
                        const vulnerableFiles = results.filter((result) => result[1] >= threshold);
                        if (vulnerableFiles.length === 0) {
                            resultText.innerText = "There were no vulnerable files found.";
                            resultCode.style.display = "none";
                        }
                        else {
                            resultText.innerText = `${vulnerableFiles.length} vulnerable files have been found.`;
                            resultCode.style.display = "block";
                            resultCode.innerText = vulnerableFiles.map((file) => file[0]).join("\n");
                        }
                        resultSummary.style.display = "block";
                        input.disabled = false;
                    }
                    break;
                case "working":
                    const processingMessage = document.createElement("p");
                    processingMessage.setAttribute("aria-busy", "true");
                    processingMessages[data.id] = processingMessage;
                    processingMessage.innerText = `Processing ${data.id}...`;
                    currentlyProcessing.appendChild(processingMessage);
                    break;
            }
        });
    }
});
//# sourceMappingURL=main.js.map