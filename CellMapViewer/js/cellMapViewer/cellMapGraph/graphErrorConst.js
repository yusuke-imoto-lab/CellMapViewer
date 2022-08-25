"use strict";

if (typeof require !== "undefined") {
  global.CellMapError = require("./cellMapError");
}


// グラフ関連のエラー定数を定義しています。

// 複数のクラスで共通して出るエラーです。
function featureDoesNotExistError(name) {
  return new CellMapError(`Feature "${name}" does not exist.`);
}
const negativeNodeIndexError = new CellMapError(
  "Negative node index."
);
function invalidThreshTypeError(threshTypeName) {
  return new CellMapError(
    `Threshold type "${threshTypeName}" is invalid.`
  );
}
const invalidThreshPercentError = new CellMapError(
  "Threshold value (%) is out of range [0, 100]."
);

// CellMapGraph クラスでのみ出るエラーです。
const emptyGraphError = new CellMapError(
  "Empty CellMapGraph can not be instantiated."
);
const lengthsNotEqualError = new CellMapError(
  "Lengths of the arrays passed to the constructor are not equal."
);

// CellMapDataReader クラスでのみ出るエラーです。
function fileReaderError(error) {
  return new CellMapError(
    `Error while reading file: ${error.message}`
  );
}
const redundantColNameError = new CellMapError(
  "Input file contains redundant column names."
);
function columnDoesNotExistError(colName) {
  return new CellMapError(
    `${colName} column does not exist in the input file.`
  );
}
function jaggedCsvError(nRow) {
  return new CellMapError(
    `In line ${nRow} in the input file, number of values are not consistent with the header.`
  )
}
function notFiniteNumberError(iLine, iCol) {
  return new CellMapError(
    `Column ${iCol} in line ${iLine} in the input file is not a finite number.`
  );
}

// Edge クラスでのみ出るエラーです。
const isLoopError = new CellMapError(
  "Loop node cannot be instantiated."
);
const negativeLengthError = new CellMapError(
  "Length value is negative."
);
function doesNotContainNodeError(i) {
  return new CellMapError(
    `Edge does not contain node ${i}.`
  );
}

// PathFinder クラスでのみ使われるエラー メッセージです。
const floatPassedError = new CellMapError(
  "Node index specified as a float value. Expected integer."
);
const nodeIndexTooLargeError = new CellMapError(
  "Node index is too large."
);
const startGoalIdenticalError = new CellMapError(
  "Start node and goal node are identical."
);


if (typeof module !== "undefined") {
  exports.featureDoesNotExistError = featureDoesNotExistError;
  exports.fileReaderError = fileReaderError;
  exports.redundantColNameError = redundantColNameError;
  exports.columnDoesNotExistError = columnDoesNotExistError;
  exports.jaggedCsvError = jaggedCsvError;
  exports.notFiniteNumberError = notFiniteNumberError;
  exports.invalidThreshTypeError = invalidThreshTypeError;
  exports.invalidThreshPercentError = invalidThreshPercentError;
  exports.emptyGraphError = emptyGraphError;
  exports.isLoopError = isLoopError;
  exports.negativeNodeIndexError = negativeNodeIndexError;
  exports.negativeLengthError = negativeLengthError;
  exports.lengthsNotEqualError = lengthsNotEqualError;
  exports.floatPassedError = floatPassedError;
  exports.nodeIndexTooLargeError = nodeIndexTooLargeError;
  exports.startGoalIdenticalError = startGoalIdenticalError;
  exports.doesNotContainNodeError = doesNotContainNodeError;
}
