/**
 * Generates telegram keyboard from array of buttons. Doesn't accept negative rows. Empty rows are removed
 * @param {{name: string, row: number, pos: number}[]} buttons array of buttons
 * @returns {string[][]} telegram keyboard
 */
export function generateKeyboard(buttons) {
    const rowCount = Math.max(...buttons.map((el) => el.row));
    let buttonsStructure = Array.from(Array(rowCount + 1), () => []);
    for (const button of buttons) {
        buttonsStructure[button.row].push(button);
    }
    buttonsStructure = buttonsStructure.filter((el) => el.length != 0);
    buttonsStructure = buttonsStructure.map((el) =>
        el.sort((a, b) => a.pos - b.pos)
    );
    return buttonsStructure.map((row) => row.map((el) => el.name));
}
