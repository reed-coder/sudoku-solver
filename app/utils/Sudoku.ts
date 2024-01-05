export type Cell = {
  value: number;
  isPredefined: boolean;
  possibleNumbers: number[];
  rowIndex: number;
  columnIndex: number;
};

const MAX_ITERATIONS = 10000;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class Sudoku {
  private grid: Cell[][];

  calculationsCount = 0;

  constructor(
    grid: number[][],
    private renderFunction?: (sudoku: Sudoku, rowIndex: number, columnIndex: number) => void,
  ) {
    this.grid = grid.map((row, rowIndex) =>
      row.map((value, columnIndex) => {
        const isPredefined = !!value;
        return {
          value,
          isPredefined,
          possibleNumbers: isPredefined ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9],
          rowIndex,
          columnIndex,
        };
      }),
    );

    this.initialize();
  }

  initialize = () => {
    this.grid.forEach((row, rowIndex) =>
      row.forEach((cell, columnIndex) => {
        if (cell.isPredefined) {
          this.removePossibleNumbers(rowIndex, columnIndex, cell.value);
        }
      }),
    );
  };

  removePossibleNumbers = (rowIndex: number, columnIndex: number, value: number) => {
    this.grid[rowIndex].forEach((cell) => {
      cell.possibleNumbers = cell.possibleNumbers.filter((possibleNumber) => possibleNumber !== value);
    });
    this.grid.forEach((row) => {
      const cell = row[columnIndex];
      cell.possibleNumbers = cell.possibleNumbers.filter((possibleNumber) => possibleNumber !== value);
    });
    const rowGroupIndex = Math.floor(rowIndex / 3);
    const columnGroupIndex = Math.floor(columnIndex / 3);
    const rowGroupStartIndex = rowGroupIndex * 3;
    const columnGroupStartIndex = columnGroupIndex * 3;

    for (let i = rowGroupStartIndex; i < rowGroupStartIndex + 3; i++) {
      for (let j = columnGroupStartIndex; j < columnGroupStartIndex + 3; j++) {
        const cell = this.grid[i][j];
        cell.possibleNumbers = cell.possibleNumbers.filter((possibleNumber) => possibleNumber !== value);
      }
    }
  };

  solve = async () => {
    let iterations = 0;
    while (!this.isSolved() && iterations < MAX_ITERATIONS) {
      for (let rowIndex = 0; rowIndex < this.grid.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < this.grid[rowIndex].length; columnIndex++) {
          let cell = this.grid[rowIndex][columnIndex];
          iterations++;
          if (cell.isPredefined || cell.value) continue;
          this.calculationsCount++;
          const solvedWithNumber = this.solveCell(cell);
          if (!solvedWithNumber) continue;
          console.log(`Cell at ${rowIndex}, ${columnIndex} solved with ${solvedWithNumber}`);
          await this.fillCell(rowIndex, columnIndex, solvedWithNumber);
          iterations = 0;
        }
      }
      if (iterations >= MAX_ITERATIONS) console.log("Too many iterations");
    }
  };

  fillCell = async (rowIndex: number, columnIndex: number, value: number) => {
    this.grid[rowIndex][columnIndex].value = value;
    this.grid[rowIndex][columnIndex].possibleNumbers = [];
    this.removePossibleNumbers(rowIndex, columnIndex, value);
    if (this.renderFunction) {
      this.renderFunction(this, rowIndex, columnIndex);
      await sleep(200);
    }
  };

  isInPossibleNumbers(cell: Cell, value: number) {
    return cell.possibleNumbers.includes(value);
  }

  solveCell = (cell: Cell): number | void => {
    if (cell.isPredefined || cell.value) return;
    if (cell.possibleNumbers.length === 1) {
      return cell.possibleNumbers[0];
    }
    // iterate throuqh possible numbers and check if there is a number that is not possible in any other cell in the row, column or group
    for (let i = 0; i < cell.possibleNumbers.length; i++) {
      const possibleNumber = cell.possibleNumbers[i];
      const existsOnlyInThisRowColumnOrGroup = this.existsOnlyInThisRowColumnOrGroup(possibleNumber, cell);
      if (existsOnlyInThisRowColumnOrGroup) {
        return possibleNumber;
      }
    }
  };

  existsOnlyInThisRowColumnOrGroup = (possibleNumber: number, cell: Cell): boolean => {
    const { rowIndex, columnIndex } = cell;
    const row = this.grid[rowIndex];
    const column = this.grid.map((row) => row[columnIndex]);
    const rowGroupIndex = Math.floor(rowIndex / 3);
    const columnGroupIndex = Math.floor(columnIndex / 3);
    const rowGroupStartIndex = rowGroupIndex * 3;
    const columnGroupStartIndex = columnGroupIndex * 3;
    const group = [];
    for (let i = rowGroupStartIndex; i < rowGroupStartIndex + 3; i++) {
      for (let j = columnGroupStartIndex; j < columnGroupStartIndex + 3; j++) {
        group.push(this.grid[i][j]);
      }
    }
    const exceptOwnCell = (cellCompare: Cell) => cell !== cellCompare;
    const rowHasPossibleNumber = row
      .filter(exceptOwnCell)
      .some((cell) => cell.possibleNumbers.includes(possibleNumber) || cell.value === possibleNumber);
    const columnHasPossibleNumber = column
      .filter(exceptOwnCell)
      .some((cell) => cell.possibleNumbers.includes(possibleNumber) || cell.value === possibleNumber);
    const groupHasPossibleNumber = group
      .filter(exceptOwnCell)
      .some((cell) => cell.possibleNumbers.includes(possibleNumber) || cell.value === possibleNumber);
    return !rowHasPossibleNumber || !columnHasPossibleNumber || !groupHasPossibleNumber;
  };

  isSolved = () => {
    let isSolved = true;
    this.grid.forEach((row) =>
      row.forEach((cell) => {
        if (!cell.value) isSolved = false;
      }),
    );
    if (isSolved) console.log(`Solved! YAAAAAYYYY!!! Took ${this.calculationsCount} calculations`);
    return isSolved;
  };

  getGrid = () => this.grid;
}
