const CellMapGraph = require("../../cellMapViewer/cellMapGraph/cellMapGraph");
const CellMapFeature = require("../../cellMapViewer/cellMapGraph/cellMapFeature");
const Edge = require("../../cellMapViewer/cellMapGraph/edge");

// テストに用いるオブジェクトです。
const idArray = ["Cell0", "Cell1", "Cell2", "Cell3"];
const xyArray = [[1, 0], [0, 0], [0, 2], [3, -1]];
const potentialArray = [-1, -4, -2, -3];
const annotationArray = ["type1", "type2", "type1", "type1"];
const otherFeatureList = [
  new CellMapFeature("other", new Float64Array([10, 11, 12, 13]))
];
const edge01 = new Edge(0, 1, true, true, 1, undefined);
const edge12 = new Edge(1, 2, true, false, 4, undefined);
const edge20 = new Edge(2, 0, true, false, 5, undefined);
const edge03 = new Edge(0, 3, true, false, 5, undefined);
const edge31 = new Edge(3, 1, true, false, 10, undefined);
const edgeListArray = [
  [edge01, edge20, edge03],
  [edge01, edge12, edge31],
  [edge12, edge20],
  [edge03, edge31]
]
const areaSortedTriangles = new Uint32Array([0, 3, 1, 0, 1, 2]);
const longestEdgeSortedTriangles = new Uint32Array([0, 1, 2, 0, 3, 1]);
const allEdgeList = [edge01, edge12, edge20, edge03, edge31];
for (const edge of allEdgeList) {
  edge.saveEnabledState();
}


// コンストラクターのテストです。
test("constructor", () => {

  // 細胞名配列の長さを基準として、他の配列の長さが異なる場合に
  // エラーが出ることを確認します。

  // x, y 配列の長さが異なる場合
  function xyDifferent() {
    new CellMapGraph(
      idArray, xyArray.slice(1), potentialArray, annotationArray,
      otherFeatureList, edgeListArray, areaSortedTriangles,
      longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
    );
  }
  expect(xyDifferent).toThrowError(lengthsNotEqualError);

  // ポテンシャル配列の長さが異なる場合
  function potentialDifferent() {
    new CellMapGraph(
      idArray, xyArray, new Float64Array(1), annotationArray,
      otherFeatureList, edgeListArray, areaSortedTriangles,
      longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
    );
  }
  expect(potentialDifferent).toThrowError(lengthsNotEqualError);

  // 辺のリストの配列の長さが異なる場合
  function edgeDifferent() {
    new CellMapGraph(
      idArray, xyArray, potentialArray, annotationArray,
      otherFeatureList, edgeListArray.slice(1), areaSortedTriangles,
      longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
    );
  }
  expect(edgeDifferent).toThrowError(lengthsNotEqualError);

  // その他の特徴量の配列の長さが異なる場合
  function otherFeatureDifferent() {
    const shortOtherFeature = new CellMapFeature("name", new Float64Array(1));
    new CellMapGraph(
      idArray, xyArray, potentialArray, annotationArray,
      [shortOtherFeature], edgeListArray, areaSortedTriangles,
      longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
    );
  }
  expect(otherFeatureDifferent).toThrowError(lengthsNotEqualError);

  // いずれの配列の長さもゼロである場合
  function arraysEmpty() {
    new CellMapGraph(
      [], [], [], [], [], [], [], [], [], potentialLabel, areaLabel, 0
    );
  }
  expect(arraysEmpty).toThrowError(emptyGraphError);

  // アノテーション配列が null でもエラーが出ないことの確認です。
  new CellMapGraph(
    idArray, xyArray, potentialArray, null, otherFeatureList, edgeListArray,
    areaSortedTriangles, longestEdgeSortedTriangles, allEdgeList,
    potentialLabel, areaLabel, 30
  );

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );

  // annotationSet をチェックします。
  expect(graph.annotationSet.size).toBe(2);
  expect(graph.annotationSet.has("type1")).toBe(true);
  expect(graph.annotationSet.has("type2")).toBe(true);

  // set zFeatureType が呼ばれて辺の 3 次元の長さが設定されていることの確認です。
  expect(edge01.len3dSquared).not.toBe(undefined);

  // setThreshTypeAndPercent が呼ばれてプロパティが設定されていることの確認です。
  expect(graph.triangleThreshType).toBe(areaLabel);
  expect(graph.triangleThreshPercent).toBe(30);
});

// zFeatureLabelList ゲッターのテストです。
test("zFeatureLabelList", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(graph.zFeatureLabelList).toEqual([potentialLabel, "other"]);
});

// dataLabelList ゲッターのテストです。
test("dataLabelList", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(graph.dataLabelList).toEqual(
    [idLabel, xLabel, yLabel, potentialLabel, annotationLabel, "other"]
  );

  // アノテーションがない場合です。
  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, null, otherFeatureList, edgeListArray,
    areaSortedTriangles, longestEdgeSortedTriangles, allEdgeList,
    potentialLabel, areaLabel, 30
  );
  expect(noAnnotationGraph.dataLabelList).toEqual(
    [idLabel, xLabel, yLabel, potentialLabel, "other"]
  );
});

// getSingleCellInfo メソッドのテストです。
test("getSingleCellInfo", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(graph.getSingleCellInfo(0)).toEqual(
    ["Cell0", 1, 0, -1, "type1", 10]
  );
  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, null, otherFeatureList, edgeListArray,
    areaSortedTriangles, longestEdgeSortedTriangles, allEdgeList,
    potentialLabel, areaLabel, 30
  );
  expect(noAnnotationGraph.getSingleCellInfo(0)).toEqual(
    ["Cell0", 1, 0, -1, 10]
  );
});

// getCellsAnnotated メソッドのテストです。
test("getCellsAnnotated", () => {

  // アノテーションで細胞が取り出せることの確認です。
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(graph.getCellsAnnotated("type1")).toEqual([0, 2, 3]);

  // アノテーションが存在しないグラフの場合に空のリストが返ることの確認です。
  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, null,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(noAnnotationGraph.getCellsAnnotated("type1")).toEqual([]);
});

// getZFeatureArrayByName メソッドのテストです。
test("getZFeatureArrayByName", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  // 不正な特徴量でエラーが出ることの確認です。
  const invalidFeatureName = "invalidFeature";
  function invalidFeature() {
    graph.getZFeatureArrayByName(invalidFeatureName);
  }
  expect(invalidFeature).toThrowError(
    featureDoesNotExistError(invalidFeatureName)
  );

  // Potential を渡すとポテンシャル配列が取り出せることの確認です。
  const potentialArrayByName = graph.getZFeatureArrayByName(
    potentialLabel
  );
  expect(potentialArrayByName[0]).toBe(-1);

  // その他の特徴量を取り出せることの確認です。
  const otherFeatureArrayByName = graph.getZFeatureArrayByName(
    "other"
  );
  expect(otherFeatureArrayByName[0]).toBe(10);
});

// zFeatureType セッターのテストです。
test("set zFeatureType", () => {

  // このセッターはコンストラクター内で呼ばれるので、
  // コンストラクター呼び出し前後で辺の長さをチェックします。
  for (const edge of allEdgeList) {
    edge.zDifference = undefined;
  }
  expect(edge01.zDifference).toBe(undefined);
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  // セッター呼び出し前の edge の z 座標の差の確認です。
  expect(edge01.zDifference).toBe(3);
  expect(edge01.len3dSquared).toBe(10);

  // 不正な特徴量を指定するとエラーが出ることの確認です。
  const invalidFeatureStr = "invalidFeature";
  function invalidFeature() {
    graph.zFeatureType = invalidFeatureStr;
  }
  expect(invalidFeature).toThrow(featureDoesNotExistError(invalidFeatureStr));
});

// triangleThreshType セッターのテストです。
test("set triangleThreshType", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );

  // セッター呼び出し前の辺の状態の確認です。
  expect(edge01.halfEdgeFrom1Enabled).toBe(false);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);

  // 正しい種類を渡した場合のプロパティの変化の確認と
  // _updateEnabledEdge が呼ばれていることの確認です。
  graph.triangleThreshType = longestEdgeLabel;
  expect(graph.triangleThreshType).toBe(longestEdgeLabel);
  expect(edge01.halfEdgeFrom1Enabled).toBe(true);
  expect(edge01.halfEdgeFrom2Enabled).toBe(false);

  // 不正な値を渡した場合のエラーの確認です。
  const invalidTypeStr = "invalidType";
  function invalidType() {
    graph.triangleThreshType = invalidTypeStr;
  }
  expect(invalidType).toThrow(invalidThreshTypeError(invalidTypeStr));
});

// triangleThreshPercent セッターのテストです。
test("set triangleThreshPercent", () => {

  // 全ての辺が有効な状態でインスタンスを生成します。
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 0
  );

  // セッター呼び出し前の辺の状態の確認です。
  expect(edge01.halfEdgeFrom1Enabled).toBe(true);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);

  // 正しい値を渡した場合のプロパティの変化の確認と
  // _updateEnabledEdge が呼ばれていることの確認です。
  graph.triangleThreshPercent = 30;
  expect(graph.triangleThreshPercent).toBe(30);
  expect(edge01.halfEdgeFrom1Enabled).toBe(false);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);

  // 不正な値を渡した場合のエラーの確認です。
  function negativeValue() {
    graph.triangleThreshPercent = -1;
  }
  expect(negativeValue).toThrow(invalidThreshPercentError);
  function tooLargeValue() {
    graph.triangleThreshPercent = 101;
  }
  expect(tooLargeValue).toThrow(invalidThreshPercentError);
});

// setThreshtTypeAndPercent メソッドのテストです。
test("setThreshTypeAndPercent", () => {

  // 全ての辺が有効な状態でインスタンスを生成します。
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 0
  );

  // メソッド呼び出し前の辺の状態の確認です。
  expect(edge01.halfEdgeFrom1Enabled).toBe(true);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);

  // 正しい種類と値を渡した場合のプロパティの変化の確認と
  // _updateEnabledEdge が呼ばれていることの確認です。
  graph.setThreshTypeAndPercent(longestEdgeLabel, 30);
  expect(graph.triangleThreshType).toBe(longestEdgeLabel);
  expect(graph.triangleThreshPercent).toBe(30);
  expect(edge01.halfEdgeFrom1Enabled).toBe(true);
  expect(edge01.halfEdgeFrom2Enabled).toBe(false);

  // 不正な種類を指定した場合のエラーの確認です。
  const invalidTypeStr = "invalidType";
  function invalidType() {
    graph.setThreshTypeAndPercent(invalidTypeStr, 30);
  }
  expect(invalidType).toThrow(invalidThreshTypeError(invalidTypeStr));

  // 不正な値を指定した場合のエラーの確認です。
  function negativeValue() {
    graph.setThreshTypeAndPercent(areaLabel, -1);
  }
  expect(negativeValue).toThrow(invalidThreshPercentError);
  function tooLargeValue() {
    graph.setThreshTypeAndPercent(areaLabel, 101);
  }
  expect(tooLargeValue).toThrow(invalidThreshPercentError);
});

// sortedTriangles ゲッターのテストです。
test("get SortedTriangles", () => {

  // 面積でソートされている場合です。
  const areaSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 0
  );
  expect(areaSortedGraph.sortedTriangles).toEqual(areaSortedTriangles);
  // 最長辺の長さでソートされている場合です。
  const edgeSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel,
    longestEdgeLabel, 0
  );
  expect(edgeSortedGraph.sortedTriangles).toEqual(
    longestEdgeSortedTriangles
  );
});

// _updateEnabledEdge メソッドのテストです。
test("_updateEnabledEdge", () => {

  // このメソッドはコンストラクターから呼ばれます。
  // よって、コンストラクターを呼んだ後の各辺の有効化状態を確認します。
  new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  // 面積上位 30% を除外するので、三角形 0-1-2 を構成するhalf-edge と、
  // 他の三角形共有されていない half-edge が無効になっているはずです。
  expect(edge01.halfEdgeFrom1Enabled).toBe(false);
  expect(edge12.halfEdgeFrom1Enabled).toBe(false);
  expect(edge12.halfEdgeFrom2Enabled).toBe(false);
  expect(edge20.halfEdgeFrom1Enabled).toBe(false);
  expect(edge20.halfEdgeFrom2Enabled).toBe(false);
  // 以下は三角形 0-3-1 を構成する half-edge と、
  // 他の三角形と共有されていない half-edge です。
  expect(edge03.halfEdgeFrom1Enabled).toBe(true);
  expect(edge03.halfEdgeFrom2Enabled).toBe(false);
  expect(edge31.halfEdgeFrom1Enabled).toBe(true);
  expect(edge31.halfEdgeFrom2Enabled).toBe(false);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);
});

// nEnabledTriangles ゲッターのテストです。
test("get nEnabledTriangles", () => {
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, annotationArray,
    otherFeatureList, edgeListArray, areaSortedTriangles,
    longestEdgeSortedTriangles, allEdgeList, potentialLabel, areaLabel, 30
  );
  expect(graph.nEnabledTriangles).toBe(1);
});
