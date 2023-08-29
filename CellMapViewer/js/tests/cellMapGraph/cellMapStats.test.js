const CellMapGraph = require("../../cellMapViewer/cellMapGraph/cellMapGraph");
const CellMapFeature = require("../../cellMapViewer/cellMapGraph/cellMapFeature");
const CellMapStats = require("../../cellMapViewer/cellMapGraph/cellMapStats");
const { defaultAnnotationLabel } = require("../../cellMapViewer/cellMapGraph/dataLabelConst");

// テストに用いるオブジェクトです。
const idArray = ["Cell0", "Cell1", "Cell2", "Cell3"];
const xyArray = [[1, 0], [0, 0], [0, 2], [3, -1]];
const potentialArray = [-1, -4, 5, -3];
const otherLabel = "other";
const otherFeatureList = [
  new CellMapFeature(otherLabel, new Float64Array([10, 11, 12, 13]), true),
  new CellMapFeature(defaultAnnotationLabel, ["type1", "type1", "type1", "type1"], false),
];
const graph = new CellMapGraph(
  idArray, xyArray, potentialArray, otherFeatureList,
  [1], [], [],
  [[], [], [], []], new Uint32Array(), new Uint32Array(), 
  [],
);
const stats = new CellMapStats(graph, [0, 1, 2]);


// getMean メソッドのテストです。
test("getMean", () => {

  expect(stats.getMean(xLabel)).toBe(1/3);
  expect(stats.getMean(yLabel)).toBe(2/3);
  expect(stats.getMean(potentialLabel)).toBe(0);
  expect(
    function(){stats.getMean(defaultAnnotationLabel)}
  ).toThrow(
    featureDoesNotExistError(defaultAnnotationLabel)
  );
});

// getVariance メソッドのテストです。
test("getVariance", () => {

  expect(stats.getVariance(potentialLabel)).toBe(14);
  expect(
    function() {stats.getVariance(defaultAnnotationLabel)}
  ).toThrow(
    featureDoesNotExistError(defaultAnnotationLabel)
  );
});

// getSD メソッドのテストです。
test("getSD", () => {

  expect(stats.getSD(potentialLabel)).toBe(Math.sqrt(14));
  expect(
    function() {stats.getSD(defaultAnnotationLabel)}
  ).toThrow(
    featureDoesNotExistError(defaultAnnotationLabel)
  );
});

// getCV メソッドのテストです。
test("getCV", () => {

  expect(stats.getCV(potentialLabel)).toBe(Infinity);
  expect(stats.getCV(otherLabel)).toBe(stats.getSD(otherLabel)/11);
  expect(
    function() {stats.getCV(defaultAnnotationLabel)}
  ).toThrow(
    featureDoesNotExistError(defaultAnnotationLabel)
  );
});
