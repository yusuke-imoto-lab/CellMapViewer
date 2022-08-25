const Edge = require("../../cellMapViewer/cellMapGraph/edge");
const PathFinder = require("../../cellMapViewer/cellMapGraph/pathFinder");


// find メソッドのテストです。
test("find", () => {

  // エラー チェックのテスト用関数および変数です。
  const dummyArray = [[]];
  let dummyStart = 0;
  let dummyGoal = 0;
  function validateErrorCheck() {
    PathFinder.find(dummyArray, dummyStart, dummyGoal);
  }
  // 始点に整数を指定しなかった場合です。
  dummyStart = 0.1;
  expect(validateErrorCheck).toThrowError(floatPassedError);
  dummyStart = 0;
  // 終点に整数を指定しなかった場合です。
  dummyGoal = 0.1;
  expect(validateErrorCheck).toThrowError(floatPassedError);
  dummyGoal = 0;
  // 始点に負の整数を指定した場合です。
  dummyStart = -1;
  expect(validateErrorCheck).toThrowError(negativeNodeIndexError);
  dummyStart = 0;
  // 終点に負の整数を指定した場合です。
  dummyGoal = -1;
  expect(validateErrorCheck).toThrowError(negativeNodeIndexError);
  dummyGoal = 0;
  // 始点に大きすぎる値を指定した場合です。
  dummyStart = 1;
  expect(validateErrorCheck).toThrowError(nodeIndexTooLargeError);
  dummyStart = 0;
  // 終点に大きすぎる値を指定した場合です。
  dummyGoal = 1;
  expect(validateErrorCheck).toThrowError(nodeIndexTooLargeError);
  dummyGoal = 0;
  // 始点と終点が一致している場合です。
  expect(validateErrorCheck).toThrowError(startGoalIdenticalError);

  // 経路探索 (2 次元) をテストするための関数です。
  function testPathFinder2d(nodeList) {
    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, 7**2);
    const edge02 = new Edge(nodeList[0], nodeList[2], true, true, 4**2);
    const edge03 = new Edge(nodeList[0], nodeList[3], false, false, 1**2);
    const edge04 = new Edge(nodeList[0], nodeList[4], true, false, 3**2);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, true, 1**2);
    const edge13 = new Edge(nodeList[1], nodeList[3], true, false, 2**2);
    const edge23 = new Edge(nodeList[2], nodeList[3], true, true, 6**2);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, false, 5**2);
    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02, edge03, edge04];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge13];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23];
    edgeListArray[nodeList[3]] = [edge03, edge13, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge04, edge34];
    edgeListArray[nodeList[5]] = [];
    const path = PathFinder.find(
      edgeListArray, nodeList[0], nodeList[3], false
    );
    expect(path).toEqual(
      [nodeList[0], nodeList[2], nodeList[1], nodeList[3]]
    );
    const pathNotFoundResult = PathFinder.find(
      edgeListArray, nodeList[0], nodeList[5], false
    );
    expect(pathNotFoundResult).toEqual([]);
  }

  testPathFinder2d([5, 0, 2, 3, 1, 4]);
  testPathFinder2d([4, 2, 5, 1, 3, 0]);
  testPathFinder2d([3, 1, 0, 5, 4, 2]);

  // 経路探索 (3 次元) をテストします。
  const edgeAB = new Edge(0, 1, true, true, 1, 2);
  const edgeAC = new Edge(0, 2, true, true, 4, 0);
  const edgeBD = new Edge(1, 3, true, true, 1, -1);
  const edgeCD = new Edge(2, 3, true, true, 4, 1);
  const edgeListArray3d = [
    [edgeAB, edgeAC],
    [edgeAB, edgeBD],
    [edgeAC, edgeCD],
    [edgeBD, edgeCD]
  ];
  // 2 次元で探索した場合の結果を確認します。
  expect(
    PathFinder.find(edgeListArray3d, 0, 3, false)
  ).toEqual(
    [0, 1, 3]
  );
  // 3 次元で探索した場合の結果を確認します。
  expect(
    PathFinder.find(edgeListArray3d, 0, 3, true)
  ).toEqual(
    [0, 2, 3]
  );
  // 3 次元で逆方向に探索した場合の結果を確認します。
  expect(
    PathFinder.find(edgeListArray3d, 3, 0, true)
  ).toEqual(
    []
  );
  // 隣接リストの構造が間違っている場合のエラーを確認します。
  expect(function() {
    PathFinder.find([[edgeBD, edgeCD], []], 0, 1, true)
  }).toThrow(
    doesNotContainNodeError(0)
  );
});
