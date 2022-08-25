const CellMapDataReader = require("../../cellMapViewer/cellMapGraph/cellMapDataReader");
const { areaLabel } = require("../../cellMapViewer/cellMapGraph/threshTypeLabelConst");


// readCsvPromise メソッドの Jest によるテストはありません。
// このメソッドには File オブジェクトを渡す必要がありますが、
// File オブジェクトは Jest (Node.js) では扱えないため、
// テストが実施できないからです。

// read2dArray メソッドのテストです。
test("read2dArray", () => {

  // 2 次元配列の格納用です。
  let data;

  // 返り値の格納用です。
  let graph;

  // エラーを出させる用の関数です。
  function errorWhileReading() {
    CellMapDataReader.read2dArray(data, areaLabel, 0);
  }

  // 列名重複時のエラーの確認です。
  data = [["name", "name"]];
  expect(errorWhileReading).toThrow(redundantColNameError);

  // 必ずあるはずの列がない場合のエラーの確認です。
  // 細胞名の列
  data = [[xLabel, yLabel, potentialLabel]];
  expect(errorWhileReading).toThrow(columnDoesNotExistError(idLabel));
  // x 座標の列
  data = [[idLabel, yLabel, potentialLabel]];
  expect(errorWhileReading).toThrow(columnDoesNotExistError(xLabel));
  // y 座標の列
  data = [[idLabel, xLabel, potentialLabel]];
  expect(errorWhileReading).toThrow(columnDoesNotExistError(yLabel));
  // ポテンシャルの列
  data = [[idLabel, xLabel, yLabel]];
  expect(errorWhileReading).toThrow(columnDoesNotExistError(potentialLabel));

  // ヘッダー行の列数と合わない場合のエラーの確認です。
  data = [[idLabel, xLabel, yLabel, potentialLabel], []];
  expect(errorWhileReading).toThrow(jaggedCsvError(2));

  // Annotation がない場合に null が入ることの確認です。
  // 同時に、列順を逆にしてもエラーが出ないことも確認します。
  data = [[potentialLabel, yLabel, xLabel, idLabel], [3, 2, 1, "id"]];
  graph = CellMapDataReader.read2dArray(data, areaLabel, 0);
  expect(graph.annotationArray).toBe(null);

  // 模擬的なデータを作成します。
  data = [
    [idLabel, xLabel, yLabel, potentialLabel, annotationLabel, "other"],
    ["Cell0", 1, 0, 10, "type0", 20],
    ["Cell1", 0, 0, 11, "type1", 21],
    ["Cell2", 0, 2, 12, "type2", 22],
    ["Cell3", 3, -1, 13, "type3", 23]
  ];

  // 数値であるべきところを文字列にしてエラーが出ることの確認です。

  const xWrongData = JSON.parse(JSON.stringify(data));
  xWrongData[1][1] = "string";
  expect(function() {
    CellMapDataReader.read2dArray(xWrongData, areaLabel, 30);
  }).toThrow(
    notFiniteNumberError(2, 2)
  );

  const yWrongData = JSON.parse(JSON.stringify(data));
  yWrongData[1][2] = "string";
  expect(function() {
    CellMapDataReader.read2dArray(yWrongData, areaLabel, 30);
  }).toThrow(
    notFiniteNumberError(2, 3)
  );

  const potentialWrongData = JSON.parse(JSON.stringify(data));
  potentialWrongData[1][3] = "string";
  expect(function() {
    CellMapDataReader.read2dArray(potentialWrongData, areaLabel, 30);
  }).toThrow(
    notFiniteNumberError(2, 4)
  );

  const otherWrongData = JSON.parse(JSON.stringify(data));
  otherWrongData[1][5] = "string";
  expect(function() {
    CellMapDataReader.read2dArray(otherWrongData, areaLabel, 30);
  }).toThrow(
    notFiniteNumberError(2, 6)
  );

  // 以下、最後まで読み込める場合の確認です。
  graph = CellMapDataReader.read2dArray(data, areaLabel, 30);

  // 返り値の linkedNodeSet の各プロパティの最後の要素の確認です。
  expect(graph.idArray[3]).toBe("Cell3");
  expect(graph.xyArray[3]).toEqual(new Float64Array([3, -1]));
  expect(graph.potentialArray[3]).toBe(13);
  expect(graph.annotationArray[3]).toBe("type3");

  // 返り値の各 sortedTriangles の確認です。
  expect(graph.areaSortedTriangles).toEqual(
    new Uint32Array([0, 3, 1, 0, 1, 2, 2, 3, 0])
  );
  expect(graph.longestEdgeSortedTriangles).toEqual(
    new Uint32Array([0, 1, 2, 0, 3, 1, 2, 3, 0])
  );

  // 返り値の allEdgeList の確認です。
  expect(graph.allEdgeList.length).toBe(6);
  for (const edge of graph.allEdgeList) {
    expect(edge).toBeInstanceOf(Edge);
  }

  // 返り値の zFeatureType が Potential (デフォルト) になっていることの確認です。
  expect(graph.zFeatureType).toBe(potentialLabel);

  // 返り値の triangleThreshType が正しく設定されていることの確認です。
  expect(graph.triangleThreshType).toBe(areaLabel);

  // 返り値の triangleThreshPercent が正しく設定されていることの確認です。
  expect(graph.triangleThreshPercent).toBe(30);
});

// _checkTriangles メソッドのテストです。
test("_checkTriangles", () => {
  // 三角形 2 枚をチェックします。
  const triangles = new Uint32Array([0, 1, 2, 3, 1, 0]);
  const xyArray = [[0, 0], [0, 3], [4, 0], [1, 1]];
  const [triangleInfoList, edgeListArray, allEdgeList] =
    CellMapDataReader._checkTriangles(triangles, xyArray);

  // triangleInfoList の確認です。
  expect(triangleInfoList.length).toBe(2);
  const info = triangleInfoList[0];
  expect(info.iTriangle).toBe(0);
  expect(info.area).toBe(6);
  expect(info.lenLongestEdge).toBe(25);

  // edgeListArray の確認です。
  expect(edgeListArray.length).toBe(4);
  expect(edgeListArray[0].length).toBe(3);
  expect(edgeListArray[0][0].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[0][0].halfEdgeFrom2Enabled).toBe(true);
  expect(edgeListArray[0][1].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[0][1].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[0][2].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[0][2].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[1].length).toBe(3);
  expect(edgeListArray[1][0].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[1][0].halfEdgeFrom2Enabled).toBe(true);
  expect(edgeListArray[1][1].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[1][1].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[1][2].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[1][2].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[2].length).toBe(2);
  expect(edgeListArray[2][0].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[2][0].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[2][1].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[2][1].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[3].length).toBe(2);
  expect(edgeListArray[3][0].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[3][0].halfEdgeFrom2Enabled).toBe(false);
  expect(edgeListArray[3][1].halfEdgeFrom1Enabled).toBe(true);
  expect(edgeListArray[3][1].halfEdgeFrom2Enabled).toBe(false);

  // allEdgeList の本数の確認です。
  expect(allEdgeList.length).toBe(5);
});

// _checkExistingEdges メソッドのテストです。
test("_checkExistingEdges", () => {

  // true が返る場合です。
  const existingEdge = new Edge(1, 2, true, false, 5, undefined);
  expect(existingEdge.halfEdgeFrom2Enabled).toBe(false);
  const anotherEdge = new Edge(0, 1, true, false, 4, undefined);
  const edgeListArray = [
    [anotherEdge], [anotherEdge, existingEdge], [existingEdge], []
  ];
  const edgeLen2dList = [];
  const exists = CellMapDataReader._checkExistingEdges(
    1, 2, edgeListArray, edgeLen2dList
  );
  expect(exists).toBe(true);
  expect(existingEdge.halfEdgeFrom2Enabled).toBe(true);
  expect(edgeLen2dList).toEqual([5]);

  // false が返る場合です。
  const doesNotExist = CellMapDataReader._checkExistingEdges(
    2, 3, edgeListArray, edgeLen2dList
  );
  expect(doesNotExist).toBe(false);
  expect(edgeLen2dList).toEqual([5]);
});

// _getSortedTriangles メソッドのテストです。
test("_getSortedTriangles", () => {

  const sortedTriangles = CellMapDataReader._getSortedTriangles(
    new Uint32Array([1, 2, 3, 4, 5, 6]),
    [
      {iTriangle: 3, area: 0, lonLongestEdge: 0},
      {iTriangle: 0, area: 0, lonLongestEdge: 0}
    ]
  );
  expect(sortedTriangles).toEqual(new Uint32Array([4, 5, 6, 1, 2, 3]));
});
