/**
 *
 * @param {HTMLInputElement} inputElement
 * @return Promise<string>
 */
export function loadFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", function (event) {
            resolve(event.target.result);
        });
        reader.addEventListener("error", reject);
        reader.addEventListener("abort", reject);
        reader.readAsText(file);
    });
}
