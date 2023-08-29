const Edge = require("../../cellMapViewer/cellMapGraph/edge");
const StreamlineMaker = require("../../cellMapViewer/cellMapGraph/streamLineMaker");

// make 関数のテストです。
test("make", () => {

    // nodeList が 10 要素の場合、startPoint として インデックス 1 が選択されます。
    // make 関数と同様のシードを使った乱数を発生させ確認しています。
    const nodeList = [1, 0, 2, 3, 4, 5, 6, 7, 8, 9];

    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, undefined);
    const edge02 = new Edge(nodeList[0], nodeList[2], true, false, undefined);
    const edge03 = new Edge(nodeList[0], nodeList[3], true, false, undefined);
    const edge04 = new Edge(nodeList[0], nodeList[4], true, false, undefined);
    const edge05 = new Edge(nodeList[0], nodeList[5], true, false, undefined);
    const edge06 = new Edge(nodeList[0], nodeList[6], true, false, undefined);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, false, undefined);
    const edge16 = new Edge(nodeList[1], nodeList[6], true, false, undefined);
    const edge17 = new Edge(nodeList[1], nodeList[7], true, false, undefined);
    const edge18 = new Edge(nodeList[1], nodeList[8], true, false, undefined);
    const edge19 = new Edge(nodeList[1], nodeList[9], true, false, undefined);
    const edge23 = new Edge(nodeList[2], nodeList[3], true, false, undefined);
    const edge29 = new Edge(nodeList[2], nodeList[9], true, false, undefined);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, false, undefined);
    const edge45 = new Edge(nodeList[4], nodeList[5], true, false, undefined);
    const edge56 = new Edge(nodeList[5], nodeList[6], true, false, undefined);
    const edge67 = new Edge(nodeList[6], nodeList[7], true, false, undefined);
    const edge78 = new Edge(nodeList[7], nodeList[8], true, false, undefined);
    const edge89 = new Edge(nodeList[8], nodeList[9], true, false, undefined);
    const allEdgeList = [
        edge01, edge02,edge03, edge04, edge05, edge06, 
        edge12, edge16, edge17, edge18, edge19,
        edge23, edge29, 
        edge34, edge45, edge56, edge67, edge78, edge89
    ]

    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02, edge03, edge04, edge05, edge06];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge16, edge17, edge18, edge19];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23, edge29];
    edgeListArray[nodeList[3]] = [edge03, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge04, edge34, edge45];
    edgeListArray[nodeList[5]] = [edge05, edge45, edge56];
    edgeListArray[nodeList[6]] = [edge06, edge16, edge56, edge67];
    edgeListArray[nodeList[7]] = [edge17, edge67, edge78];
    edgeListArray[nodeList[8]] = [edge18, edge78, edge89];
    edgeListArray[nodeList[9]] = [edge19, edge29, edge89];

    const xyArray = [
        [Math.sqrt(3), 1], [0, 0], [0, 2], [-Math.sqrt(3), 1], [-Math.sqrt(3), -1], 
        [0, -2], [Math.sqrt(3), -1], [2 * Math.sqrt(3), 0], [2 * Math.sqrt(3), 2], [Math.sqrt(3), 3] 
    ]

    const zArray = new Array(10).fill(0);

    // 以下、startPoint の方向ベクトルを変えて、ストリームラインを作成します。
    {
        const vector = {
            x: [Math.sqrt(3), 1, Math.sqrt(3), -Math.sqrt(3), -1, -Math.sqrt(3), 0, 0, 1, Math.sqrt(3)],
            y: [1, Math.sqrt(3), 1, -1, 0, 1, 1, 1, 0, 1]
        };

        const expectArray = [[{x: 0, y: 0, z: 0}, {x: Math.sqrt(3) * 0.5, y: 1.5, z: 0}, {x: Math.sqrt(3), y: 2, z: 0}, {x: Math.sqrt(3) * 1.5, y: 2.5, z: 0}]];
        const result = StreamlineMaker.make(vector, xyArray, zArray, edgeListArray, allEdgeList);

        expect(result[0].length).toEqual(4);

        expect(result[0][0].x).toEqual(expectArray[0][0].x);
        expect(result[0][0].y).toEqual(expectArray[0][0].x);
        expect(result[0][0].z).toEqual(expectArray[0][0].z);

        expect(result[0][1].x).toBeCloseTo(expectArray[0][1].x, 0.0001);
        expect(result[0][1].y).toBeCloseTo(expectArray[0][1].y, 0.0001);
        expect(result[0][1].z).toEqual(expectArray[0][1].z);

        expect(result[0][2].x).toBeCloseTo(expectArray[0][2].x, 0.0001);
        expect(result[0][2].y).toBeCloseTo(expectArray[0][2].y, 0.0001);
        expect(result[0][2].z).toEqual(expectArray[0][2].z);

        expect(result[0][3].x).toBeCloseTo(expectArray[0][3].x, 0.0001);
        expect(result[0][3].y).toBeCloseTo(expectArray[0][3].y, 0.0001);
        expect(result[0][3].z).toEqual(expectArray[0][3].z);
        }

    {
        const vector = {
            x: [Math.sqrt(3), -1, Math.sqrt(3), -Math.sqrt(3), -1, -Math.sqrt(3), 0, 0, 1, Math.sqrt(3)],
            y: [1, Math.sqrt(3), 1, -1, 0, 1, 1, 1, 0, 1]
        };

        const expectArray = [[{x: 0, y: 0, z: 0}, {x: -Math.sqrt(3) * 0.5, y: 1.5, z: 0}]];
        const result = StreamlineMaker.make(vector, xyArray, zArray, edgeListArray, allEdgeList);

        expect(result[0].length).toEqual(2);

        expect(result[0][0].x).toEqual(expectArray[0][0].x);
        expect(result[0][0].y).toEqual(expectArray[0][0].x);
        expect(result[0][0].z).toEqual(expectArray[0][0].z);

        expect(result[0][1].x).toBeCloseTo(expectArray[0][1].x, 0.0001);
        expect(result[0][1].y).toBeCloseTo(expectArray[0][1].y, 0.0001);
        expect(result[0][1].z).toEqual(expectArray[0][1].z);
    }
    {
        const vector = {
            x: [Math.sqrt(3), 1, Math.sqrt(3), -Math.sqrt(3), -1, -Math.sqrt(3), 0, 0, 1, Math.sqrt(3)],
            y: [1, 0, 1, -1, 0, 1, 1, 1, 0, 1]
        };

        const expectArray = [[{x: 0, y: 0, z: 0}, {x: Math.sqrt(3), y: 0, z: 0}, {x: Math.sqrt(3) * 1.5, y: 0.5, z: 0}, {x: Math.sqrt(3) * 2, y: 2, z: 0},]];
        const result = StreamlineMaker.make(vector, xyArray, zArray, edgeListArray, allEdgeList);

        expect(result[0].length).toEqual(4);

        expect(result[0][0].x).toEqual(expectArray[0][0].x);
        expect(result[0][0].y).toEqual(expectArray[0][0].x);
        expect(result[0][0].z).toEqual(expectArray[0][0].z);

        expect(result[0][1].x).toBeCloseTo(expectArray[0][1].x, 0.0001);
        expect(result[0][1].y).toBeCloseTo(expectArray[0][1].y, 0.0001);
        expect(result[0][1].z).toEqual(expectArray[0][1].z);

        expect(result[0][2].x).toBeCloseTo(expectArray[0][2].x, 0.0001);
        expect(result[0][2].y).toBeCloseTo(expectArray[0][2].y, 0.0001);
        expect(result[0][2].z).toEqual(expectArray[0][2].z);

        expect(result[0][3].x).toBeCloseTo(expectArray[0][3].x, 0.0001);
        expect(result[0][3].y).toBeCloseTo(expectArray[0][3].y, 0.0001);
        expect(result[0][3].z).toEqual(expectArray[0][3].z);
    }
})

// _getStartPoint 関数のテストです。
// 本テストは、StreamlineMaker クラス内の該当箇所のコードのコメント アウトを変更すると実行できます。
test("_getStartPoint", () => {

    const result = StreamlineMaker._getStartPointList(5, 1);
    expect(result.sort()).toEqual([0, 1, 2, 3, 4]);
})

// getAdjacentInfo 関数のテストです。
test("_getAdjacentInfo", () => {

    const nodeList = [0, 1, 2, 3, 4];
    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, undefined);
    const edge02 = new Edge(nodeList[0], nodeList[2], false, true, undefined);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, true, undefined);
    const edge13 = new Edge(nodeList[1], nodeList[3], true, true, undefined);
    const edge23 = new Edge(nodeList[2], nodeList[3], false, true, undefined);
    const edge24 = new Edge(nodeList[2], nodeList[4], true, false, undefined);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, true, undefined);
    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge13];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23, edge24];
    edgeListArray[nodeList[3]] = [edge13, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge24, edge34];

    {
        const expectInfo = [];
        expectInfo.push({node: 1, edge: edge01});
        expectInfo.push({node: 2, edge: edge02});
        const result = StreamlineMaker._getAdjacentInfo(0, edgeListArray);
        expect(result).toEqual(expectInfo);
    }
    {
        const expectInfo = [];
        expectInfo.push({node: 0, edge: edge02});
        expectInfo.push({node: 1, edge: edge12});
        expectInfo.push({node: 3, edge: edge23});
        expectInfo.push({node: 4, edge: edge24});
        const result = StreamlineMaker._getAdjacentInfo(2, edgeListArray);
        expect(result).toEqual(expectInfo);
    }
})

// _getCrossPoint 関数のテストです。
test("_getCrossPoint", () => {

    const nodeList = [0, 1, 2, 3, 4];
    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, undefined);
    const edge02 = new Edge(nodeList[0], nodeList[2], false, true, undefined);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, true, undefined);
    const edge13 = new Edge(nodeList[1], nodeList[3], true, true, undefined);
    const edge23 = new Edge(nodeList[2], nodeList[3], false, true, undefined);
    const edge24 = new Edge(nodeList[2], nodeList[4], true, false, undefined);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, true, undefined);
    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge13];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23, edge24];
    edgeListArray[nodeList[3]] = [edge13, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge24, edge34];


    const expectPoint1 = {x: 1, y: 1, z: 1, dx: 1, dy: 1};
    const edgeNode1 = {x: 2, y: 0, z: 1, dx: 2, dy: 0};
    const edgeNode2 = {x: 0, y: 2, z: 1, dx: 0, dy: 2};
    const result1 = StreamlineMaker._getCrossPoint(
        {x: 0, y: 0, z: 0, dx: 1, dy: 1}, edgeNode1, edgeNode2
        );
    expect(result1).toEqual(expectPoint1);


    const expectPoint2 = {x: 2, y: 2, z: 1, dx: 0, dy: 2};
    const edgeNode3 = {x: 4, y: 2, z: 1, dx: 0, dy: 2};
    const result2 = StreamlineMaker._getCrossPoint(
        expectPoint1, edgeNode3, edgeNode2
        );
    expect(result2).toEqual(expectPoint2);


    const expectPoint3 = {x: 2, y: 3, z: 2, dx:1, dy:1.5};
    const edgeNode4 = {x: 0, y: 4, z: 3, dx: 2, dy: 1};
    const result3 = StreamlineMaker._getCrossPoint(
        expectPoint2, edgeNode3, edgeNode4
        );
    expect(result3).toEqual(expectPoint3);

})

// _getOppositeSideEdgeList 関数のテストです。
test("_getOppositeSideEdgeList", () => {

    const nodeList = [0, 1, 2, 3, 4];
    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, undefined);
    const edge02 = new Edge(nodeList[0], nodeList[2], true, false, undefined);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, false, undefined);
    const edge13 = new Edge(nodeList[1], nodeList[3], true, false, undefined);
    const edge23 = new Edge(nodeList[2], nodeList[3], true, false, undefined);
    const edge24 = new Edge(nodeList[2], nodeList[4], true, false, undefined);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, false, undefined);
    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge13];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23, edge24];
    edgeListArray[nodeList[3]] = [edge13, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge24, edge34];

    {
        const adjacentInfo = [{node: 1, edge: edge01}, {node: 2, edge: edge02}];
        const searchingEdgeList = [edge01, edge02, edge12, edge13, edge23, edge24, edge24];
        const result = StreamlineMaker._getOppositeSideEdgeList(
            adjacentInfo, edgeListArray, searchingEdgeList
        );
        expect(result).toEqual([edge12]);
    }
    {
        const adjacentInfo = [
            {node: 0, edge: edge02}, {node: 1, edge: edge12}, {node: 3, edge: edge23}, {node: 4, edge: edge24}
        ];
        const searchingEdgeList = [edge01, edge02, edge12, edge13, edge23, edge24, edge24, edge34];
        const result = StreamlineMaker._getOppositeSideEdgeList(
            adjacentInfo, edgeListArray, searchingEdgeList
        );
        expect(result).toEqual([edge01, edge13, edge34]);
    }
})

// getAdjascentSideEdgeList 関数のテストです。
test("_getAdjascentSideEdgeList", () => {

    const nodeList = [0, 1, 2, 3, 4];
    const edge01 = new Edge(nodeList[0], nodeList[1], true, false, undefined);
    const edge02 = new Edge(nodeList[0], nodeList[2], true, false, undefined);
    const edge12 = new Edge(nodeList[1], nodeList[2], true, false, undefined);
    const edge13 = new Edge(nodeList[1], nodeList[3], true, false, undefined);
    const edge23 = new Edge(nodeList[2], nodeList[3], true, false, undefined);
    const edge24 = new Edge(nodeList[2], nodeList[4], true, false, undefined);
    const edge34 = new Edge(nodeList[3], nodeList[4], true, false, undefined);
    const edgeListArray = [];
    edgeListArray[nodeList[0]] = [edge01, edge02];
    edgeListArray[nodeList[1]] = [edge01, edge12, edge13];
    edgeListArray[nodeList[2]] = [edge02, edge12, edge23, edge24];
    edgeListArray[nodeList[3]] = [edge13, edge23, edge34];
    edgeListArray[nodeList[4]] = [edge24, edge34];
    const searchingEdgeList = [edge01, edge02, edge12, edge13, edge23, edge24, edge34];

    {
        
        const result = StreamlineMaker._getAdjascentSideEdgeList(
            0, 1, 2, edgeListArray, searchingEdgeList
        );
        expect(JSON.stringify(result)).toStrictEqual(JSON.stringify([edge13, edge23]));
    }
    {
        const result = StreamlineMaker._getAdjascentSideEdgeList(
            1, 2, 3, edgeListArray, searchingEdgeList
        );
        expect(JSON.stringify(result)).toEqual(JSON.stringify([edge23, edge34]));
    }
    {
        const searchingEdgeList1 = [edge01, edge02, edge12, edge13, edge24];
        const result = StreamlineMaker._getAdjascentSideEdgeList(
            1, 2, 3, edgeListArray, searchingEdgeList1
        );
        expect(JSON.stringify(result)).toEqual(JSON.stringify([edge24]));
    }
})


