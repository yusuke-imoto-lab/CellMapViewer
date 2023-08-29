const CellMapGraph = require("../../cellMapViewer/cellMapGraph/cellMapGraph");
const CellMapFeature = require("../../cellMapViewer/cellMapGraph/cellMapFeature");
const Edge = require("../../cellMapViewer/cellMapGraph/edge");

// テストに用いるオブジェクトです。
const idArray = ["Cell0", "Cell1", "Cell2", "Cell3"];
const xyArray = [[1, 0], [0, 0], [0, 2], [3, -1]];
const potentialArray = [-1, -4, -2, -3];
const annotationIndexList = [0];
const vectorLabelList = ["velocity"];
const xVectorIndexList = [2];
const otherFeatureList = [
  new CellMapFeature("annotation", ["type1", "type2", "type1", "type1"], false),
  new CellMapFeature("other", new Float64Array([10, 11, 12, 13]), true),
  new CellMapFeature("velocity_x", new Float64Array([1, 2, 3, 4]), true),
  new CellMapFeature("velocity_y", new Float64Array([-1, 2, -3, 4]), true),
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
      idArray, xyArray.slice(1), potentialArray, otherFeatureList,
      annotationIndexList, vectorLabelList, xVectorIndexList,
      edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
      allEdgeList
    );
  }
  expect(xyDifferent).toThrowError(lengthsNotEqualError);

  // ポテンシャル配列の長さが異なる場合
  function potentialDifferent() {
    new CellMapGraph(
      idArray, xyArray, new Float64Array(1), otherFeatureList, 
      annotationIndexList,vectorLabelList, xVectorIndexList,
      edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
      allEdgeList
    );
  }
  expect(potentialDifferent).toThrowError(lengthsNotEqualError);

  // 辺のリストの配列の長さが異なる場合
  function edgeDifferent() {
    new CellMapGraph(
      idArray, xyArray, potentialArray, otherFeatureList,
      annotationIndexList,vectorLabelList, xVectorIndexList,
      edgeListArray.slice(1), areaSortedTriangles, longestEdgeSortedTriangles, 
      allEdgeList
    );
  }
  expect(edgeDifferent).toThrowError(lengthsNotEqualError);

  // その他の特徴量の配列の長さが異なる場合
  function otherFeatureDifferent() {
    const shortOtherFeature = new CellMapFeature("name", new Float64Array(1));
    new CellMapGraph(
      idArray, xyArray, potentialArray, [shortOtherFeature], 
      annotationIndexList,vectorLabelList, xVectorIndexList,
      edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
      allEdgeList
    );
  }
  expect(otherFeatureDifferent).toThrowError(lengthsNotEqualError);

  // ベクトルのラベルの個数と、データ列の個数が異なる場合
  function vectorLabelDifferent() {
    new CellMapGraph(
      idArray, xyArray, potentialArray, otherFeatureList, 
      annotationIndexList,[], xVectorIndexList,
      edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
      allEdgeList
    );
  }
  expect(vectorLabelDifferent).toThrowError(vectorDataError);

  // いずれの配列の長さもゼロである場合
  function arraysEmpty() {
    new CellMapGraph(
      [], [], [], [], [], [], [], [], [], [], []
    );
  }
  expect(arraysEmpty).toThrowError(emptyGraphError);

  // アノテーション配列が空でもエラーが出ないことの確認です。
  new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    [], vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList,
  );

  // ベクトル関連の配列が空でもエラーが出ないことの確認です。
  new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList.slice(0, 2), 
    annotationIndexList, [], [],
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList,
  );

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList, vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );

  // annotationSet をチェックします。
  expect(graph.annotationSet.size).toBe(2);
  expect(graph.annotationSet.has("type1")).toBe(true);
  expect(graph.annotationSet.has("type2")).toBe(true);

  // set zFeatureType が呼ばれて辺の 3 次元の長さが設定されていることの確認です。
  expect(edge01.len3dSquared).not.toBe(undefined);

});

// zFeatureLabelList ゲッターのテストです。
test("zFeatureLabelList", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(graph.zFeatureLabelList).toEqual([potentialLabel, "annotation", "other", "velocity_x", "velocity_y"]);
});

// dataLabelList ゲッターのテストです。
test("dataLabelList", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(graph.dataLabelList).toEqual(
    [idLabel, xLabel, yLabel, potentialLabel, "annotation", "other", "velocity_x", "velocity_y"]
  );

  // アノテーションがない場合です。
  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList.slice(1), 
    [], vectorLabelList, [1],
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(noAnnotationGraph.dataLabelList).toEqual(
    [idLabel, xLabel, yLabel, potentialLabel, "other", "velocity_x", "velocity_y"]
  );
});

// getSingleCellInfo メソッドのテストです。
test("getSingleCellInfo", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(graph.getSingleCellInfo(0)).toEqual(
    ["Cell0", 1, 0, -1, "type1", 10, 1, -1]
  );

  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList.slice(1), 
    [], vectorLabelList, [1],
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(noAnnotationGraph.getSingleCellInfo(0)).toEqual(
    ["Cell0", 1, 0, -1, 10, 1, -1]
  );

  const noVectorGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList.slice(0, 2), 
    annotationIndexList, [], [],
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(noVectorGraph.getSingleCellInfo(0)).toEqual(
    ["Cell0", 1, 0, -1, "type1", 10]
  );
});

// getCellsAnnotated メソッドのテストです。
test("getCellsAnnotated", () => {

  // アノテーションで細胞が取り出せることの確認です。
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(graph.getCellsAnnotated("type1")).toEqual([0, 2, 3]);

  // アノテーションが存在しないグラフの場合に空のリストが返ることの確認です。
  const noAnnotationGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList.slice(1), 
    [], vectorLabelList, [1],
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  expect(noAnnotationGraph.getCellsAnnotated("type1")).toEqual([]);
});

// getZFeatureArrayByName メソッドのテストです。
test("getZFeatureArrayByName", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
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
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );

  // 不正な特徴量を指定するとエラーが出ることの確認です。
  const invalidFeatureStr = "invalidFeature";
  function invalidFeature() {
    graph.zFeatureType = invalidFeatureStr;
  }
  expect(invalidFeature).toThrow(featureDoesNotExistError(invalidFeatureStr));
});

// setThreshtTypeAndPercent メソッドのテストです。
test("setThreshTypeAndPercent", () => {

  // 全ての辺が有効な状態でインスタンスを生成します。
  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );

  // メソッド呼び出し前の辺の状態の確認です。
  expect(edge01.halfEdgeFrom1Enabled).toBe(true);
  expect(edge01.halfEdgeFrom2Enabled).toBe(true);

  // 正しい種類と値を渡した場合のプロパティの変化の確認と
  // _updateEnabledEdge が呼ばれていることの確認です。
  graph.setThreshTypeAndPercent(longestEdgeLabel, 30);
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

// enabledTriangles ゲッターのテストです。
test("get enabledTriangles", () => {

  // 面積でソートされている場合です。
  const areaSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  areaSortedGraph.setThreshTypeAndPercent(areaLabel, 50);
  expect(areaSortedGraph.enabledTriangles).toEqual(areaSortedTriangles.slice(0,3));
  // 最長辺の長さでソートされている場合です。
  const edgeSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  edgeSortedGraph.setThreshTypeAndPercent(longestEdgeLabel, 50);
  expect(edgeSortedGraph.enabledTriangles).toEqual(
    longestEdgeSortedTriangles.slice(0,3)
  );
});

// disabledTriangles ゲッターのテストです。
test("get disabledTriangles", () => {

  // 面積でソートされている場合です。
  const areaSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  areaSortedGraph.setThreshTypeAndPercent(areaLabel, 50);
  expect(areaSortedGraph.disabledTriangles).toEqual(areaSortedTriangles.slice(3));
  // 最長辺の長さでソートされている場合です。
  const edgeSortedGraph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  edgeSortedGraph.setThreshTypeAndPercent(longestEdgeLabel, 50);
  expect(edgeSortedGraph.disabledTriangles).toEqual(
    longestEdgeSortedTriangles.slice(3)
  );
});


// _updateEnabledTriangles メソッドのテストです。
test("_updateEnabledTriangles", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  // 面積上位 50% を除外します。
  graph.setThreshTypeAndPercent(areaLabel, 50);
  expect(graph.enabledTriangles).toEqual(areaSortedTriangles.slice(0,3));
  expect(graph.disabledTriangles).toEqual(areaSortedTriangles.slice(3));

  // 除外面積を面積上位 1% に更新します。
  graph.setThreshTypeAndPercent(areaLabel, 1);
  expect(graph.enabledTriangles).toEqual(areaSortedTriangles);
  expect(graph.disabledTriangles).toEqual(new Uint32Array());
});

// _updateEnabledEdge メソッドのテストです。
test("_updateEnabledEdge", () => {

  const graph = new CellMapGraph(
    idArray, xyArray, potentialArray, otherFeatureList, 
    annotationIndexList,vectorLabelList, xVectorIndexList,
    edgeListArray, areaSortedTriangles, longestEdgeSortedTriangles, 
    allEdgeList
  );
  // 面積上位 30% を除外します。
  graph.setThreshTypeAndPercent(areaLabel, 30);
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
