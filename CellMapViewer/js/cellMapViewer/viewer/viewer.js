"use strict";

/**
 * 細胞地図のビューワーを表すクラスです。
 *
 * @class Viewer
 */
class Viewer {

  // HTML 要素のフォントです。
  #fontFamily = "Arial";

  // Three.js 関連のフィールドです。

  // シーンです。
  #scene = new THREE.Scene();

  // カメラです。
  #camera = new THREE.PerspectiveCamera(60, 1, 1, 1000).translateZ(30);

  // レンダラーです。
  // 画像保存が可能になるように preserveDrawingBuffer を true にします。
  #renderer = new THREE.WebGLRenderer({
    antialias: true, preserveDrawingBuffer: true
  });

  // 描画領域となる HTML 要素です。
  #canvas = this.#renderer.domElement;

  // カメラ コントロールです。
  #controls = null;

  // 全ての細胞を表すジオメトリです。
  #geomSurface = new THREE.BufferGeometry();
  #geom = new THREE.BufferGeometry();

  // 細胞地図の表面を表すメッシュのマテリアルです。
  #meshMaterial = new THREE.MeshLambertMaterial(
    { vertexColors: true, side: THREE.DoubleSide }
  );
  // 細胞地図の表面を表すメッシュです。
  #mesh = new THREE.Mesh(this.#geomSurface, this.#meshMaterial);

  // 点群描画用のテクスチャーです。
  #discTexture = new THREE.TextureLoader().load(discDataUrl);

  // 全ての細胞を表す点群のマテリアルです。
  #pointsMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    transparent: true,
    map: this.#discTexture,
    alphaTest: 0.5
  });

  // 全ての細胞を表す点群です。
  #cellPoints = new THREE.Points(this.#geom, this.#pointsMaterial);

  // 選択中の細胞を表すジオメトリです。
  #selectedCellGeom = new THREE.BufferGeometry();
  // 選択中の細胞を表す点群のマテリアルです。
  #selectedPointsMaterial = new THREE.PointsMaterial({
    color: 0xff0000,
    transparent: true,
    map: this.#discTexture,
    alphaTest: 0.5
  });
  // 選択中の細胞を表す点群です。
  #selectedCellPoints = new THREE.Points(
    this.#selectedCellGeom, this.#selectedPointsMaterial
  );

  // 経路を表すメッシュです。
  #pathLineMesh = null;
  // 経路を表すメッシュのマテリアルです。
  #pathLineMaterial = new MeshLineMaterial({ color: 0xff0000 });

  // グリッドを表すメッシュです。
  #gridHelper = null;

  // マウスのボタンが押下されたときの x 座標です。
  #mousedownX = 0;
  // マウスのボタンが押下されたときの y 座標です。
  #mousedownY = 0;
  // マウスのボタンが押下されたときに、
  // Shift キーまたは Ctrl キー (mac では Control キー) または
  // Command キー (Windows では Windows キー) が押されていたかです。
  #mousedownWithKey = false;

  // ドラッグ選択のヘルパーです。
  #selectionHelper = null;

  // クリック位置にあるオブジェクトを調べるための光線です。
  #rayCaster = new THREE.Raycaster();

  // ビューワーから設定できる値です。
  #settings = new ViewerSettings();

  // #canvas や #guiElem の親要素です。
  #parentElement = null;


  // dat.GUI 関連のフィールドです。

  // GUI です。
  #gui = new dat.GUI({ autoPlace: false, width: 300 });

  // #gui の HTML 要素です。
  #guiElem = this.#gui.domElement;

  // #gui の三角形除去の閾値を設定するためのフォルダーです。
  #guiFolderThresh = this.#gui.addFolder("Threshold");

  // #gui で三角形除去の閾値の種類を選択するコントローラーです。
  #threshTypeController = null;

  // #gui で三角形除去の閾値の % 値を設定するコントローラーです。
  #threshPercentController = null;

  // #gui で z 軸の値に用いる特徴量を設定するためのフォルダーです。
  #guiFolderZ = this.#gui.addFolder("Z-axis");

  // #guiFolderZ で z 軸の値に用いる特徴量を設定するためのコントローラーです。
  #zFeatureController = null;

  // #guiFolderZ で z 軸のスケールを設定するためのコントローラーです。
  #zScaleController = null;

  // #guiFolderZ でグリッドの z 軸を設定するためのコントローラーです。
  #gridZController = null;

  // #gui で着色を設定するためのフォルダーです。
  #guiFolderColor = this.#gui.addFolder("Color");

  // #guiFolderColor で表面の着色を設定するためのフォルダーです。
  #guiFolderColorSurface = this.#guiFolderColor.addFolder("Surface");

  // #guiFolderColor で点群の着色を設定するためのフォルダーです。
  #guiFolderColorPoints = this.#guiFolderColor.addFolder("Cells");

  // #guiFolderColorSurface で着色に用いる特徴量を設定するためのコントローラーです。
  #colorFeatureController = null;

  // #guiFolderColorSurface でカラー マップを設定するためのコントローラーです。
  #colorMapController = null;

  // #guiFolderColorSurface で
  // カラー マップの最小値を設定するためのコントローラーです。
  #colorMinController = null;

  // #guiFolderColorSurface で
  // カラー マップの最大値を設定するためのコントローラーです。
  #colorMaxController = null;

  // #guiFolderColorPoints で着色に用いる特徴量を設定するためのコントローラーです。
  #pointsColorFeatureController = null;

  // #guiFolderColorPoints でカラー マップを設定するためのコントローラーです。
  #pointsColorMapController = null;

  // #guiFolderColorPoints で
  // カラー マップの最小値を設定するためのコントローラーです。
  #pointsColorMinController = null;

  // #guiFolderColorPoints で
  // カラー マップの最大値を設定するためのコントローラーです。
  #pointsColorMaxController = null;

  // #guiFolderColor で背景色を設定するためのコントローラーです。
  #bgColorController = null;

  // #gui で点の大きさや線の太さを設定するためのフォルダーです。
  #guiFolderSize = this.#gui.addFolder("Size");

  // #guiFolderSize でアノテーションのフォント サイズを設定するためのコントローラーです。
  #annotationFontSizeController = null;

  // #guiFolderSize で細胞を表す点の大きさを設定するためのコントローラーです。
  #cellSizeController = null;

  // #guiFolderSize で選択された細胞を表す点の大きさを設定するための
  // コントローラーです。
  #selectionSizeController = null;

  // #guiFolderSize で経路を表す線の太さを設定するためのコントローラーです。
  #pathWidthController = null;

  // #gui でアノテーションや点群の表示を切り替えるためのフォルダーです。
  #guiFolderView = this.#gui.addFolder("View");

  // #guiFolderView でアノテーションの表示を
  // 切り替えるためのコントローラーです。
  #showAnnotationsController = null;

  // #guiFolderView で地図表面を表すメッシュの表示を
  // 切り替えるためのコントローラーです。
  #showSurfaceController = null;

  // #guiFolderView で全細胞を表す点群の表示を
  // 切り替えるためのコントローラーです。
  #showCellPointsController = null;

  // #guiFolderView で選択中の細胞を表す点群の表示を
  // 切り替えるためのコントローラーです。
  #highlightSelectionController = null;

  // #guiFolderView でグリッドの表示を
  // 切り替えるためのコントローラーです。
  #showGridController = null;

  // #gui でドラッグによる捜査対象を切り替えるコントローラーです。
  #dragActionController = null;

  // #gui で設定ファイルの入出力を行うためのフォルダーです。
  #guiFolderSettings = this.#gui.addFolder("Config");

  // #gui でパスの抽出を行うためのフォルダーです。
  #guiFolderPath = this.#gui.addFolder("Path");

  // カラー マップ オブジェクトです。
  // グラフが読み込まれているときにインスタンス化します。
  #colorMap = new ColorMap(
    this.#settings.colorMap,
    this.#settings.colorMin, this.#settings.colorMax
  );
  #pointsColorMap = new ColorMap(
    this.#settings.pointsColorMap,
    this.#settings.pointsColorMin, this.#settings.pointsColorMax
  );

  // カラーバー表示領域用の <div> 要素です。
  #colorBarBoxSurface = document.createElement("div");
  #colorBarBoxPoints = document.createElement("div");

  // アノテーションの表示と管理のためのオブジェクトを登録するリストです。
  #annotationObjList = [];

  // 細胞地図のグラフ データです。
  #graph = null;

  // 読み込まれているファイルの名前です。
  #loadedFileName = "";

  // ファイルの読み込みが完了したときに呼ばれるコールバックです。
  #onLoaded = function () { };

  // 選択中の細胞 (ノード、頂点) のインデックスのリストです。
  #selectedCellList = [];

  // 選択中の細胞の情報が変化したときに呼ばれるコールバックです。
  #onSelectionChange = function (isShowingChart) { console.log(isShowingChart); };

  // 経路を表示しているかどうかを表すフラグです。
  #isShowingPath = false;

  // chart オブジェクトへの参照です。
  #chart = null;

  /**
   * コンストラクターです。
   * @param {HTMLElement} parentElement ビューワーの親 HTML 要素です。
   * @memberof Viewer
   */
  constructor(parentElement) {

    // 親要素を設定します。
    this.parentElement = parentElement;

    // 描画領域のサイズを設定、イベント ハンドラーを登録します。
    this.#canvas.style.height = "100%";
    this.#canvas.style.width = "100%";
    this.#canvas.addEventListener("mousedown", this.#handleMousedown);
    this.#canvas.addEventListener("mouseup", this.#handleMouseup);

    // シーンの背景色を初期化します。
    this.#scene.background = new THREE.Color();
    this.#updateSceneBgColor();

    // ライトを用意します。
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.setScalar(100);
    this.#scene.add(light);
    this.#scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // 各サイズを設定します。
    this.#pointsMaterial.size = this.#settings.cellSize;
    this.#selectedPointsMaterial.size = this.#settings.selectionSize;
    this.#pathLineMaterial.lineWidth = this.#settings.pathWidth;

    // 光線の軌跡からどの程度離れたオブジェクトとの交点を検出するかを調節します。
    this.#rayCaster.params.Points.threshold = 0.05;

    // カラー バー表示用のボックスのスタイルを設定し、カラー バーを表示します。
    this.#colorBarBoxSurface.style.display = "flex";
    this.#colorBarBoxSurface.style.position = "absolute";
    this.#colorBarBoxSurface.style.top = "0";
    this.#colorBarBoxSurface.style.color = "white";
    this.#colorBarBoxSurface.style.fontFamily = this.#fontFamily;

    this.#colorBarBoxPoints.style.display = "flex";
    this.#colorBarBoxPoints.style.position = "absolute";
    this.#colorBarBoxPoints.style.top = "0";
    this.#colorBarBoxPoints.style.left = "100px";
    this.#colorBarBoxPoints.style.color = "white";
    this.#colorBarBoxPoints.style.fontFamily = this.#fontFamily;

    this.#updateColorBars();

    // カメラ コントロールを初期化、設定します。
    // (注意) この初期化は、#canvas と parentElement の親子関係を
    //   設定した後に行う必要があります。
    this.#controls = new THREE.TrackballControls(this.#camera, this.#canvas);
    this.#controls.staticMoving = true;
    this.#controls.panSpeed = 2.0;
    this.#controls.rotateSpeed = 2.0;
    this.#controls.addEventListener("start", this.#handleControlStart);
    this.#controls.addEventListener("end", this.#handleControlEnd);

    // dat.GUI の GUI を用意します。
    this.#initGui();

    // 手前に来るべき要素の表示順序を指定します。
    const maxZIndex = 2147483647;
    this.#guiElem.style.zIndex = maxZIndex;
    this.#colorBarBoxSurface.style.zIndex = maxZIndex - 1;
    this.#colorBarBoxPoints.style.zIndex = maxZIndex - 1;

    // その他初期設定を反映させます。
    this.#updateSurfaceVisibility();
    this.#updateCellPointsVisibility();
    this.#updateSelectionVisibility();
    this.#updateDragAction();

    // レンダー ループを開始します。
    this.#render();
  }

  /**
   * dat.GUI を初期化します。HTML 要素の親子関係は変更されません。
   * 
   * @memberof Viewer
   */
  #initGui = () => {

    // dat.GUI を右上に配置します。
    this.#guiElem.style.position = "absolute";
    this.#guiElem.style.top = "0";
    this.#guiElem.style.right = "0";

    // 閾値設定用のコントローラーを追加します。
    this.#threshTypeController = this.#guiFolderThresh.
      add(this.#settings, "threshType", threshTypeLabelList).
      name("Type").onFinishChange(this.#handleThreshTypeChange);
    this.#threshPercentController = this.#guiFolderThresh.
      add(this.#settings, "threshAreaPercent", 0, 100).
      name("%").onFinishChange(this.#handleThreshPercentChange);
    // Type が変更されたときに % の設定対象を変更するようにします。
    this.#threshTypeController.onChange(
      (value) => {
        let setTarget;
        switch (value) {
          case areaLabel:
            setTarget = "threshAreaPercent";
            break;
          case longestEdgeLabel:
            setTarget = "threshEdgePercent";
            break;
          default:
            // ここには到達しないはずですが、到達した場合にわかりやすいよう
            // 例外を投げます。
            throw threshControllerNotImplementedError(value);
        }
        this.#threshPercentController.remove();
        this.#threshPercentController = this.#guiFolderThresh.
          add(this.#settings, setTarget, 0, 100).
          name("%").onFinishChange(this.#handleThreshPercentChange);
      }
    );

    const featureOptions = [this.#settings.zFeature];

    // z 座標設定用のコントローラーを追加します。
    this.#zFeatureController = this.#guiFolderZ.add(
      this.#settings, "zFeature", featureOptions).
      name("Feature").onFinishChange(this.#handleZFeatureTypeChange);
    this.#zScaleController = this.#guiFolderZ.add(
      this.#settings, "zScale", 0).
      name("Scale").onChange(this.#handleZScaleChange);
    // 1 行上が onChange なのは、onFinishChange だと
    // 入力テキストボックスにフォーカスしただけで発火してしまうからです。
    this.#gridZController = this.#guiFolderZ.add(
      this.#settings, "gridZ", 0).
      name("Grid").onChange(this.#handleGridZChange);

    // 表面の着色の設定用のコントローラーを追加します。
    this.#colorFeatureController = this.#guiFolderColorSurface.add(
      this.#settings, "colorFeature", featureOptions).
      name("Feature").onFinishChange(this.#handleColorFeatureChange);
    this.#colorMapController = this.#guiFolderColorSurface.add(
      this.#settings, "colorMap", colorMapLabelList).
      name("Color map").onFinishChange(this.#handleColorMapChange);
    this.#colorMinController = this.#guiFolderColorSurface.add(
      this.#settings, "colorMin").
      name("Min").onFinishChange(this.#handleColorMapChange);
    this.#colorMaxController = this.#guiFolderColorSurface.add(
      this.#settings, "colorMax").
      name("Max").onFinishChange(this.#handleColorMapChange);
    this.#guiFolderColorSurface.add(this, "_setColorMinMaxToFeatureRange").
      name("Set min/max to feature range");
    //this.#guiFolderColorSurface.open();

    this.#pointsColorFeatureController = this.#guiFolderColorPoints.add(
      this.#settings, "pointsColorFeature", featureOptions).
      name("Feature").onFinishChange(this.#handlePointsColorFeatureChange);
    this.#pointsColorMapController = this.#guiFolderColorPoints.add(
      this.#settings, "pointsColorMap", colorMapLabelList).
      name("Color map").onFinishChange(this.#handleColorMapChange);
    this.#pointsColorMinController = this.#guiFolderColorPoints.add(
      this.#settings, "pointsColorMin").
      name("Min").onFinishChange(this.#handleColorMapChange);
    this.#pointsColorMaxController = this.#guiFolderColorPoints.add(
      this.#settings, "pointsColorMax").
      name("Max").onFinishChange(this.#handleColorMapChange);
    this.#guiFolderColorPoints.add(this, "_setPointsColorMinMaxToFeatureRange").
      name("Set min/max to feature range");

    // 背景色の着色用のコントローラーを追加します。
    this.#bgColorController = this.#guiFolderColor.addColor(
      this.#settings, "bgColor").
      name("Background").onFinishChange(this.#handleBgColorChange);

    // 点の大きさや線の太さを設定するためのコントローラーを追加します。
    this.#annotationFontSizeController = this.#guiFolderSize.add(
      this.#settings, "annotationFontSize", 0).
      name("Annotation").onFinishChange(this.#handleAnnotationFontSizeChange);
    this.#cellSizeController = this.#guiFolderSize.add(
      this.#settings, "cellSize", 0).
      name("Cells").onFinishChange(this.#handleCellSizeChange);
    this.#selectionSizeController = this.#guiFolderSize.add(
      this.#settings, "selectionSize", 0).
      name("Selection").onFinishChange(this.#handleSelectionSizeChange);
    this.#pathWidthController = this.#guiFolderSize.add(
      this.#settings, "pathWidth", 0).
      name("Path width").onFinishChange(this.#handlePathWidthChange);

    // 細胞のアノテーションや地図の表面、細胞を表す点群の表示を切り替える
    // コントローラーを追加します。
    this.#showAnnotationsController = this.#guiFolderView.add(
      this.#settings, "showAnnotations").
      name("Annotation").
      onFinishChange(this.#handleShowAnnotationsChange);
    this.#showSurfaceController = this.#guiFolderView.add(
      this.#settings, "showSurface").
      name("Surface").
      onFinishChange(this.#handleShowSurfaceChange);
    this.#showCellPointsController = this.#guiFolderView.add(
      this.#settings, "showCellPoints").
      name("Cells").
      onFinishChange(this.#handleShowCellPointsChange);
    this.#highlightSelectionController = this.#guiFolderView.add(
      this.#settings, "highlightSelection").
      name("Highlight selection").
      onFinishChange(this.#handleHighlightSelectionChange);
    this.#showGridController = this.#guiFolderView.add(
      this.#settings, "showGrid").
      name("Grid").
      onFinishChange(this.#handleShowGridChange);

    // ドラッグによる操作対象を切り替えるドロップダウンメニューを追加します。
    this.#dragActionController = this.#gui.add(
      this.#settings, "dragAction", dragActionList).
      name("Drag action").onFinishChange(this.#handleDragActionChange);

    // ビューのリセット ボタンを追加します。
    this.#gui.add(this, "_handleCameraReset").name("Reset camera");

    // 経路探索ボタンを追加します。
    this.#guiFolderPath.add(this, "_findAndShowPath2d").name("Find 2D path");
    this.#guiFolderPath.add(this, "_findAndShowPath3d").name("Find 3D path");

    // 画像保存ボタンを追加します。
    this.#gui.add(this, "_saveImage").name("Save image");

    // 設定のリセット ボタンを追加します。
    this.#guiFolderSettings.add(this, "_resetSettings").name("Initialize");
    // 設定読み込みボタンを追加します。
    this.#guiFolderSettings.add(this, "_loadSettings").name("Load...");
    // 設定保存ボタンを追加します。
    this.#guiFolderSettings.add(this, "_saveSettings").name("Save");
  }

  /**
   * レンダー ループを開始します。
   * 
   * @memberof Viewer
   */
  #render = () => {

    this.#controls.update();
    this.#checkResize();
    this.#renderer.render(this.#scene, this.#camera);
    requestAnimationFrame(this.#render);
  }

  /**
   * キャンバスのサイズが変化したとき、次のものを更新します。  
   * ・レンダラーのサイズ  
   * ・カメラのアスペクト比  
   * ・(表示中であれば) アノテーションの位置
   * 
   * @memberof Viewer
   */
  #checkResize = () => {

    const width = this.#canvas.clientWidth;
    const height = this.#canvas.clientHeight;
    const needResize =
      this.#canvas.width !== width || this.#canvas.height !== height;

    if (needResize) {

      this.#renderer.setSize(width, height, false);
      this.#camera.aspect = width / height;
      this.#camera.updateProjectionMatrix();

      if (this.#settings.showAnnotations) {
        this.#updateAnnotationPositionScreen();
      }
    }
  }

  /**
   * 親要素を取得します。
   *
   * @type {HTMLElement}
   * @memberof Viewer
   */
  get parentElement() {
    return this.#parentElement;
  }

  /**
   * 親要素を設定します。親子関係は更新されます。
   *
   * @type {HTMLElement}
   * @memberof Viewer
   */
  set parentElement(value) {
    this.#parentElement = value;
    this.#parentElement.appendChild(this.#canvas);
    this.#parentElement.appendChild(this.#guiElem);
    this.#parentElement.appendChild(this.#colorBarBoxSurface);
    this.#parentElement.appendChild(this.#colorBarBoxPoints);
    for (const annotationObj of this.#annotationObjList) {
      this.#parentElement.appendChild(annotationObj.element);
    }
  }

  /**
   * 読み込まれているファイルの名前を取得します。
   *
   * @readonly
   * @memberof Viewer
   */
  get loadedFileName() {
    return this.#loadedFileName;
  }

  /**
   * ファイルの読み込みが完了したときに呼ばれるコールバックを取得します。
   *
   * @memberof Viewer
   */
  get onLoaded() {
    return this.#onLoaded;
  }

  /**
   * ファイルの読み込みが完了したときに呼ばれるコールバックを設定します。
   *
   * @memberof Viewer
   */
  set onLoaded(func) {
    this.#onLoaded = func;
  }

  /**
   * 細胞の選択状態が変化したときに呼ばれるコールバックを取得します。
   *
   * @memberof Viewer
   */
  get onSelectionChange() {
    return this.#onSelectionChange;
  }

  /**
   * 細胞の選択状態が変化した時に呼ばれるコールバックを設定します。
   *
   * @memberof Viewer
   */
  set onSelectionChange(func) {
    this.#onSelectionChange = func;
  }

  /**
   * Chart を削除します。
   *
   * @memberof Viewer
   */
  resetChart = () => {

    this.#chart = null;
  }

  /**
   * Chart の特徴量を変更します。
   * 
   * @memberof Viewer
   */
  #updateChart = () => {
    
    // Chart が存在しない場合は何もしません。
    if (this.#chart === null) return;

    const zArray = this.#graph.zArray;

    // データを取得します。
    const data = [];
    for (let i of this.#selectedCellList) {
      // 表示されているパラメーターを取得します。
      data.push(zArray[i]);
    }

    this.#chart.data.datasets[0].data = data;
    this.#chart.options.scales.y.title.text = this.#settings.zFeature;

    this.#chart.update();
  }

  /**
   * Chart を作成します。
   *
   * @memberof Viewer
   */
  drawChart = (context) => {

    const idArray = this.#graph.idArray;
    const zArray = this.#graph.zArray;

    // 描画データ用の配列を用意します。
    const labels = [];
    const data = [];
    for (let i of this.#selectedCellList) {
      // 先頭の要素を取得し、X 軸のラベルにします。
      labels.push(idArray[i]);
      // 表示されているパラメーターを取得します。
      data.push(zArray[i]);
    }

    // グラフを描画します。
    this.#chart = new Chart(context, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: 'red',
        }]
      },
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: this.#settings.zFeature
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
        },
        maintainAspectRatio: false
      }
    });
  }

  /**
   * 読み込まれているデータの属性のリストを返します。
   * 読み込まれているデータがない場合は null です。
   *
   * @readonly
   * @memberof Viewer
   */
  get dataLabelList() {

    if (this.#graph === null) {
      return null;
    }
    return this.#graph.dataLabelList;
  }

  /**
   * 選択中の細胞のインデックスのリストを取得します。
   *
   * @readonly
   * @memberof Viewer
   */
  get selectedCellList() {
    return this.#selectedCellList;
  }

  /**
   * 読み込まれたているデータの i 番目の細胞の情報を取得します。
   * 取得される順番は dataLabelList プロパティの値と同じです。
   * 読み込まれているデータがない場合は null です。
   *
   * @param {number} i 細胞のインデックスです。
   * @memberof Viewer
   */
  getSingleCellInfo = (i) => {

    if (this.#graph === null) {
      return null;
    }
    return this.#graph.getSingleCellInfo(i);
  }

  /**
   * 選択中の細胞の統計量 (CellMapStats) を返します。
   *
   * @memberof Viewer
   */
  getStatsOfSelection = () => {

    return new CellMapStats(this.#graph, this.#selectedCellList);
  }

  /**
   * マウスのボタンが押下されたときのイベントを処理します。
   *
   * @param {Event} event
   * @memberof Viewer
   */
  #handleMousedown = (event) => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 左ボタンでなければ何もしません。
    if (event.button !== 0) {
      return;
    }

    // 座標を取得します。
    this.#mousedownX = event.clientX;
    this.#mousedownY = event.clientY;

    // Shift キーまたは Ctrl キー (mac では Control キー) または
    // Command キー (Windows では Windows キー) が押されていたかを記録します。
    this.#mousedownWithKey = (
      event.shiftKey || event.ctrlKey || event.metaKey
    );

    // Shift などのキー + ドラッグまたは矩形選択モードの場合、
    // 矩形を可視化するヘルパーを作成します。
    if (
      this.#mousedownWithKey ||
      this.#settings.dragAction === rectangleSelectionLabel
    ) {
      this.#selectionHelper = new THREE.SelectionHelper(this.#renderer);
      this.#selectionHelper.element.style.border = "1px solid #55aaff";
      this.#selectionHelper.element.style.backgroundColor =
        "rgba(75, 160, 255, 0.5)";
      this.#selectionHelper.element.style.position = "fixed";
      this.#selectionHelper.onPointerDown(event);
    }
  }

  /**
   * マウスのボタンが離されたときのイベントを処理します。
   *
   * @param {Event} event
   * @memberof Viewer
   */
  #handleMouseup = (event) => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 離されたボタンが左ボタンでなければ何もしません。
    if (event.button !== 0) {
      return;
    }

    // 使っていたヘルパーを破棄します。
    if (this.#selectionHelper !== null) {
      this.#selectionHelper.dispose();
    }

    // 座標を取得します。
    const mouseupX = event.clientX;
    const mouseupY = event.clientY;

    // マウスのボタンが押下されたときの座標と一致している場合、
    // すなわちクリックの場合は、その座標にある細胞を選択します。
    if (mouseupX === this.#mousedownX && mouseupY === this.#mousedownY) {

      const [ndcX, ndcY] = this.#getNdcXY(mouseupX, mouseupY);
      this.#selectSingleCellAt(ndcX, ndcY);
      this.#handleSelectionChange();
      return;
    }

    // 以下、クリックではない、すなわちドラッグされた場合です。

    // Shift + ドラッグもしくは細胞選択モードの場合、
    // ドラッグでできた矩形の内側にある細胞を選択します。
    if (
      this.#mousedownWithKey ||
      this.#settings.dragAction === rectangleSelectionLabel
    ) {

      const [ndcX1, ndcY1] = this.#getNdcXY(this.#mousedownX, this.#mousedownY);
      const [ndcX2, ndcY2] = this.#getNdcXY(mouseupX, mouseupY);
      this.#selectCellsWithin(ndcX1, ndcY1, ndcX2, ndcY2);
      this.#handleSelectionChange();
    }
  }

  /**
   * カメラ コントロールの操作が始まったときの処理です。
   *
   * @memberof Viewer
   */
  #handleControlStart = () => {

    if (this.#settings.showAnnotations) {
      this.#hideAnnotations();
    }
  }

  /**
   * カメラ コントロールの操作が終了したときの処理です。
   *
   * @memberof Viewer
   */
  #handleControlEnd = () => {

    if (this.#settings.showAnnotations) {
      this.#updateAnnotationPositionScreen();
      this.#showAnnotations();
    }
  }

  /**
   * 選択されている細胞が変化したときの処理です。
   * コールバックの呼び出し、ジオメトリの更新、経路の消去を行います。
   *
   * @memberof Viewer
   */
  #handleSelectionChange = (isShowingChart) => {

    this.onSelectionChange(isShowingChart);
    this.#updateSelectionGeom();
    this.#isShowingPath = false;
    this.#updatePath();
  }

  /**
   * グラフの三角形分割の三角形を除去する閾値の種類が
   * 変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleThreshTypeChange = () => {

    this.#updateGraphThreshTypeAndPercent();
    this.#updateGeomIndex();
    this.#updateGeomDrawRange();
  }

  /**
   * グラフの三角形分割の三角形を除去する閾値が
   * 変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleThreshPercentChange = () => {

    this.#updateGraphThreshPercent();
    this.#updateGeomDrawRange();
  }

  /**
   * グラフで z 座標に用いる特徴量の種類が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleZFeatureTypeChange = () => {

    this.#updateGraphZFeature();
    this.#updateGeomZ();
    this.#updateAnnotationPositionWorld();
    this.#updateAnnotationPositionScreen();
    this.#updateChart();
  }

  /**
   * グラフで z 座標のスケールが変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleZScaleChange = () => {

    this.#updateGeomZ();
    this.#updateAnnotationPositionWorld();
    this.#updateAnnotationPositionScreen();
  }

  /**
   * グラフでグリッドの z 座標が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleGridZChange = () => {
    if (this.#gridHelper !== null) {
      this.#gridHelper.position.z = this.#settings.gridZ * this.#settings.zScale;
    }
  }

  /**
   * 着色に用いる特徴量の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleColorFeatureChange = () => {

    this.#updateColorMinMaxToNewFeature();
    this.#colorMinController.updateDisplay();
    this.#colorMaxController.updateDisplay();
    this.#handleColorMapChange();
  }
  #handlePointsColorFeatureChange = () => {

    this.#updatePointsColorMinMaxToNewFeature();
    this.#pointsColorMinController.updateDisplay();
    this.#pointsColorMaxController.updateDisplay();
    this.#handleColorMapChange();
  }

  /**
   * 着色に用いるカラー マップの種類の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleColorMapChange = () => {

    this.#renewColorMapObject();
    this.#updateGeomColor();
    this.#updateColorBars();
  }

  /**
   * 背景色の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleBgColorChange = () => {

    this.#updateSceneBgColor();
  }

  /**
   * アノテーションの設定が変更されたときの処理です。
   */
  #handleAnnotationFontSizeChange = () => {

    this.#updateAnnotationFontSize();
  }

  /**
   * 細胞を表す点のサイズの設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleCellSizeChange = () => {

    this.#pointsMaterial.size = this.#settings.cellSize;
  }

  /**
   * 選択された細胞を表す点のサイズの設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleSelectionSizeChange = () => {

    this.#selectedPointsMaterial.size = this.#settings.selectionSize;
  }

  /**
   * 経路を表す線の太さの設定が変更されたときの処理です。
   *
   */
  #handlePathWidthChange = () => {

    this.#pathLineMaterial.lineWidth = this.#settings.pathWidth;
  }

  /**
   * アノテーションの表示/非表示プロパティが変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleShowAnnotationsChange = () => {

    this.#updateAnnotationPositionScreen();
    this.#updateAnnotationVisibility();
  }

  /**
   * 地図の表面を表すメッシュの表示/非表示の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleShowSurfaceChange = () => {

    this.#updateSurfaceVisibility();
  }

  /**
   * 全細胞を表す点群の表示/非表示設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleShowCellPointsChange = () => {

    this.#updateCellPointsVisibility();
  }

  /**
   * 選択中の細胞の強調表示の有無の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleHighlightSelectionChange = () => {

    this.#updateSelectionVisibility();
  }

  /**
   * グリッド表示の有無の設定が変更されたときの処理です。
   * 
   * @memberof Viewer
   */
  #handleShowGridChange = () => {

    this.#updateGridVisibility();
  }

  /**
   * ドラッグによる操作対象の設定が変更されたときの処理です。
   *
   * @memberof Viewer
   */
  #handleDragActionChange = () => {

    this.#updateDragAction();
  }

  /**
   * カメラのコントロールがリセットされたときの処理です。
   *
   * @memberof Viewer
   */
  _handleCameraReset = () => {

    this.#controls.reset();
    this.#updateAnnotationPositionScreen();
  }

  /**
   * 指定された座標 (NDC、-1 ～ 1) にある細胞を選択します。
   * 細胞がない場合、何も選択されていない状態となります。
   *
   * @param {number} x x 座標です。
   * @param {number} y y 座標です。
   * @memberof Viewer
   */
  #selectSingleCellAt = (x, y) => {

    // 指定された位置から画面奥に向かって光線を発し、
    // 交点を作るオブジェクトを探します。
    const position = new THREE.Vector2(x, y);
    this.#rayCaster.setFromCamera(position, this.#camera);
    const intersectArray = this.#rayCaster.intersectObject(this.#cellPoints);

    // 何もないところをクリックした場合です。
    if (intersectArray.length === 0) {

      // マウスのボタン押下時に Shift などのキーが押されていた場合です。
      if (this.#mousedownWithKey) return;

      // それ以外の場合、細胞が何も選択されていない状態にします。
      this.#selectedCellList = [];
    }

    // 細胞があるところをクリックした場合です。
    else {

      // 最も手前の細胞のインデックスを取り出します。
      const clickedCellIdx = intersectArray[0].index;

      // マウスのボタン押下時に Shift などのキーが押されていた場合です。
      if (this.#mousedownWithKey) {
        this.#addSelection([clickedCellIdx]);
      }

      // マウスのボタン押下時に Shift などのキーが押されていなかった場合です。
      else {
        // それまでに選択されていた細胞の選択を解除し、
        // クリックされた細胞が選択された状態にします。
        this.#selectedCellList = [clickedCellIdx];
      }
    }
  }

  /**
   * 4 つの座標 (NDC、-1 ～ 1)で指定した矩形の範囲内で、
   * カメラの near 平面より奥にある細胞を選択します。
   * 細胞が無い場合、何も選択されていない状態となります。
   *
   * @param {number} x1 矩形の頂点その 1 の x 座標です。
   * @param {number} y1 矩形の頂点その 1 の y 座標です。
   * @param {number} x2 矩形の頂点その 1 の対角にある頂点の x 座標です。
   * @param {number} y2 矩形の頂点その 1 の対角にある頂点の y 座標です。
   * @memberof Viewer
   */
  #selectCellsWithin = (x1, y1, x2, y2) => {

    // 選択用の矩形を作成し、
    // 頂点その 1 とその対角にある頂点の座標を設定します。
    const selectionBox = new THREE.SelectionBox(this.#camera, this.#scene);
    // z 座標は SelectionBox 内部で使用されないので、
    // どのような値を設定しても挙動は同じです。
    // ここでは -1 を設定します。
    selectionBox.startPoint.set(x1, y1, -1);
    selectionBox.endPoint.set(x2, y2, -1);

    // 選択用の矩形に奥行きを持たせた frustum を更新します。
    selectionBox.updateFrustum();

    // Frustum 中に含まれるジオメトリ中の点 (ただし、描画中) を調べます。
    const frustum = selectionBox.frustum;
    const drawnPointSet = new Set(this.#geomSurface.index.array);
    const positions = this.#geom.getAttribute("position").array;
    // 点の座標を格納する 3 次元ベクトルです。
    const point = new THREE.Vector3();
    // メッシュが回転または移動されていた場合に備えて変換行列を取得します。
    const matrixWorld = this.#cellPoints.matrixWorld;
    // Frustum 中に含まれる点を格納するリストです。
    const pointsWithinFrustum = [];
    // ジオメトリ中の点の座標をループします。
    for (const i of drawnPointSet) {
      // x, y, z 座標を取得します。
      point.set(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]);
      // 変換行列を作用させます。
      point.applyMatrix4(matrixWorld);
      // Frustum 中に点が含まれていればリストに追加します。
      if (frustum.containsPoint(point)) {
        pointsWithinFrustum.push(i);
      }
    }

    // マウスのボタン押下時に Shift などのキーが押されていた場合です。
    if (this.#mousedownWithKey) {
      // Frustum 中に含まれていた点の選択されている/いないを反転します。
      this.#addSelection(pointsWithinFrustum);
    }
    // マウスのボタン押下時に Shift などのキーが押されていなかった場合です。
    else {
      // Frustum 中に含まれていた点 (細胞、頂点、ノード) のみが
      // 選択された状態にします。
      this.#selectedCellList = pointsWithinFrustum;
    }
  }

  /**
   * マウス関連イベントが発生した位置 (ビューポート上の座標) を
   * NDC 座標 (-1 ～ 1) に変換します。
   *
   * @param {number} x 変換する x 座標です。
   * @param {number} y 変換する y 座標です。
   * @return {Array<number>} 変換後の x、y 座標を [x, y] の形で返します。
   * @memberof Viewer
   */
  #getNdcXY = (x, y) => {

    // キャンバスの左上角を基準にした座標と、幅、高さを取得します。
    const canvasRect = this.#canvas.getBoundingClientRect();
    const canvasX = x - canvasRect.x;
    const canvasY = y - canvasRect.y;
    const canvasW = canvasRect.width;
    const canvasH = canvasRect.height;

    // NDC 座標に変換します。
    const ndcX = canvasX / canvasW * 2 - 1;
    const ndcY = -canvasY / canvasH * 2 + 1;

    return [ndcX, ndcY];
  }

  /**
   * 指定された細胞を選択対象に追加します。
   *
   * @param {Array<number>} addedCellList 選択対象に追加する細胞の
   *     インデックスのリストです。
   * @memberof Viewer
   */
  #addSelection = (addedCellList) => {

    // 追加する細胞のうち、まだ選択されていないものを追加します。
    for (const i of addedCellList) {

      if (this.#selectedCellList.includes(i)) continue;

      this.#selectedCellList.push(i);
    }
  }

  /**
   * 細胞が 2 個選択されている場合に、その経路を探索して表示します。
   * z 座標は考慮しません。
   * ジオメトリやグラフが存在しない場合や、既に経路が表示されている場合や、
   * 細胞が 2 個選択されていない場合には何もせずメッセージを表示します。
   *
   * @memberof Viewer
   */
  _findAndShowPath2d = () => {
    this.#findAndShowPath(false);
  }

  /**
   * 細胞が 2 個選択されている場合に、その経路を探索して表示します。
   * ただし、z 座標の登りを禁止します。
   * ジオメトリやグラフが存在しない場合や、既に経路が表示されている場合や、
   * 細胞が 2 個選択されていない場合には何もせずメッセージを表示します。
   * 
   * @memberof Viewer
   */
  _findAndShowPath3d = () => {
    this.#findAndShowPath(true);
  }

  /**
   * 細胞が 2 個選択されている場合に、その経路を探索して表示します。
   * ジオメトリやグラフが存在しない場合や、既に経路が表示されている場合や、
   * 細胞が 2 個選択されていない場合には何もせずメッセージを表示します。
   *
   * @param {boolean} disableClimb 経路探索において
   *     z 座標の登りを禁止するか否かです。
   * @memberof Viewer
   */
  #findAndShowPath = (disableClimb) => {

    // データが読み込まれていない場合です。
    // メッセージを表示して終了します。
    if (this.#graph === null) {
      window.alert(cannotFindPathMessage);
      return;
    }

    // 既に経路が表示されている場合です。
    // メッセージを表示して終了します。
    if (this.#isShowingPath) {
      window.alert(pathAlreadyShownMessage);
      return;
    }

    // 選択されている細胞が 2 個ではない場合です。
    // メッセージを表示して終了します。
    if (this.#selectedCellList.length !== 2) {
      window.alert(cannotFindPathMessage);
      return;
    }

    // 選択されている 2 個の細胞を結ぶ経路を探索します。
    const iStartNode = this.#selectedCellList[0];
    const iGoalNode = this.#selectedCellList[1];
    let path = PathFinder.find(
      this.#graph.edgeListArray, iStartNode, iGoalNode, disableClimb
    );

    // z 座標の登りを禁止して見つからなかった場合は始点と終点を逆にして
    // もう一度探索します。
    if (disableClimb && !path.length) {
      path = PathFinder.find(
        this.#graph.edgeListArray, iGoalNode, iStartNode, disableClimb
      );
    }

    // 見つからなかった場合はメッセージを表示して終了します。
    if (!path.length) {
      window.alert(pathDoesNotExistMessage);
      return;
    }

    // 以下、経路が見つかった場合です。
    this.#selectedCellList = path;
    this.#handleSelectionChange(true);

    // 可視化フラグをオンにし、経路を可視化する処理を呼びます。
    this.#isShowingPath = true;
    this.#updatePath();
  }

  /**
   * カラー マップの最小値/最大値を着色用の特徴量の最小値/最大値にセットします。
   *
   * @memberof Viewer
   */
  _setColorMinMaxToFeatureRange = () => {

    this.#settings.resetColorMinMax();
    this.#colorMinController.updateDisplay();
    this.#colorMaxController.updateDisplay();
    this.#handleColorMapChange();
  }

  _setPointsColorMinMaxToFeatureRange = () => {

    this.#settings.resetPointsColorMinMax();
    this.#pointsColorMinController.updateDisplay();
    this.#pointsColorMaxController.updateDisplay();
    this.#handleColorMapChange();
  }

  /**
   * 設定をリセットします。リセット後の設定を GUI と描画中の細胞地図に反映させます。
   *
   * @memberof Viewer
   */
  _resetSettings = () => {
    // 設定をリセットします。
    this.#settings.reset();
    // GUI を更新します。
    this._updateGUI();
  }

  /**
   * GUI に設定の現在値を反映させます。
   * 加えて、設定の変更を描画等に反映させます。
   */
  _updateGUI = () => {

    this.#threshTypeController.updateDisplay();
    this.#handleThreshTypeChange();

    this.#threshPercentController.remove();
    this.#threshPercentController = this.#guiFolderThresh.
      add(this.#settings, "threshAreaPercent", 0, 100).
      name("%").onFinishChange(this.#handleThreshTypeChange);
    this.#handleThreshPercentChange();

    this.#zFeatureController.updateDisplay();
    this.#handleZFeatureTypeChange();

    this.#zScaleController.updateDisplay();
    this.#handleZScaleChange();

    this.#gridZController.updateDisplay();
    this.#handleGridZChange();

    this.#colorFeatureController.updateDisplay();
    this.#handleColorFeatureChange();
    this.#pointsColorFeatureController.updateDisplay();
    this.#handlePointsColorFeatureChange();

    this.#colorMapController.updateDisplay();
    this.#colorMinController.updateDisplay();
    this.#colorMaxController.updateDisplay();
    this.#pointsColorMapController.updateDisplay();
    this.#pointsColorMinController.updateDisplay();
    this.#pointsColorMaxController.updateDisplay();
    this.#handleColorMapChange();

    this.#bgColorController.updateDisplay();
    this.#handleBgColorChange();

    this.#annotationFontSizeController.updateDisplay();
    this.#handleAnnotationFontSizeChange();

    this.#cellSizeController.updateDisplay();
    this.#handleCellSizeChange();

    this.#selectionSizeController.updateDisplay();
    this.#handleSelectionSizeChange();

    this.#pathWidthController.updateDisplay();
    this.#handlePathWidthChange();

    this.#showAnnotationsController.updateDisplay();
    this.#handleShowAnnotationsChange();

    this.#showSurfaceController.updateDisplay();
    this.#handleShowSurfaceChange();

    this.#showCellPointsController.updateDisplay();
    this.#handleShowCellPointsChange();

    this.#highlightSelectionController.updateDisplay();
    this.#handleHighlightSelectionChange();

    this.#showGridController.updateDisplay();
    this.#handleShowGridChange();

    this.#dragActionController.updateDisplay();
    this.#handleDragActionChange();

    // 経路を表示中の場合、設定変更後の経路に更新します。
    this.#updatePath();
  }

  /**
   * 描画されている細胞地図を画像として保存します。
   *
   * @memberof Viewer
   */
  _saveImage = () => {

    // GUI は隠しておきます。
    this.#gui.hide();

    // html2canvas 関数のオプションです。
    // これらを指定しないとスクロール バーの幅の分画像が大きくなってしまいます。
    const options = {
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight
    };

    // parentElement を <canvas> 要素に変換し、保存します。
    html2canvas(this.parentElement, options).then(canvas => {
      canvas.toBlob(
        function (result) {

          const imageUrl = URL.createObjectURL(result);

          // タイムスタンプ付きのファイル名を生成します。
          const fileName = formatDateTime(new Date()) + "-CellMap.png";

          // ダウンロード用の使い捨てリンクを用意し、
          // クリック時の動作を呼び出します。
          const a = document.createElement("a");
          a.download = fileName;
          a.href = imageUrl;
          a.click();

          URL.revokeObjectURL(imageUrl);
        }
      );
    });

    // GUI を再表示します。
    this.#gui.show();
  }


  /**
   * 設定を JSON ファイルとして保存します。
   *
   * @memberof Viewer
   */
  _saveSettings = () => {
    // CSV ファイルを保存します。
    var blob = new Blob([JSON.stringify(this.#settings, null, "  ")], { type: "application/json" });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // 日時からファイル名を作成します。
    link.download = formatDateTime(new Date()) + "-Config.json";
    link.click();
  }

  /**
   * 設定ファイルを読み込みます。
   */
  _loadSettings = () => {

    // JSON ファイル入力ダイアログボックスを開きます。
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = e => {

      // 選択されたファイルを取得します。
      var file = e.target.files[0];

      // ファイルの内容をテキストとして読み込みます。
      var reader = new FileReader();
      reader.readAsText(file);

      // 読み込み完了後、JSON をパースして GUI に反映します。
      reader.onload = readerEvent => {
        // JSON をパースします。
        var json = JSON.parse(readerEvent.target.result);
        this.#settings.resetBy(json)
        // GUI を更新します。
        this._updateGUI();
      }
    }

    input.click();
  }

  /**
   * 日時を日付文字列に変換する関数です。
   */
  formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const MM = ("0" + (date.getMonth() + 1)).slice(-2);
    const dd = ("0" + date.getDate()).slice(-2);
    const HH = ("0" + date.getHours()).slice(-2);
    const mm = ("0" + date.getMinutes()).slice(-2);
    const ss = ("0" + date.getSeconds()).slice(-2);
    return yyyy + MM + dd + "-" + HH + mm + ss;
  }

  /**
   * 入力 CSV ファイルを読み込み、現在の設定に従って表示します。
   *
   * @param {File} file 入力 CSV ファイル オブジェクトです。
   * @memberof Viewer
   */
  loadFileData = (file) => {

    CellMapDataReader.readCsvPromise(
      file, this.#settings.threshType, this.#settings.threshPercent
    ).then(cellMapGraph => {

      this.#loadedFileName = file.name;
      this.loadCellMapGraph(cellMapGraph);

    }).catch(e => {
      if (e instanceof CellMapError) {
        window.alert(e.message);
      }
      else {
        window.alert(`${unexpectedErrorMessage}\n${e.message}`);
      }
    });
  }

  /**
   * 細胞地図のグラフを読み込み、現在の設定に従って表示します。
   *
   * @param {CellMapGraph} graph 細胞地図のグラフです。
   * @memberof Viewer
   */
  loadCellMapGraph = (graph) => {

    this.#graph = graph;

    // 設定の z 座標用の特徴量が既定値と異なる場合です。
    if (this.#settings.zFeature !== defaultZFeatureLabel) {

      // 設定の z 座標用の特徴量がグラフに存在する場合は、
      // グラフの z 座標用の特徴量を変更します。
      if (
        this.#graph.zFeatureLabelList.includes(this.#settings.zFeature)
      ) {
        this.#graph.zFeatureType = this.#settings.zFeature;
      }
      // 設定の z 座標用の特徴量がグラフに存在しない場合は、
      // 設定の z 座標用の特徴量を既定値に戻します。
      else {
        this.#settings.zFeature = defaultZFeatureLabel;
        // GUI に反映させます。
        this.#zFeatureController.updateDisplay();
      }
    }

    // 設定の着色用の特徴量がグラフに存在しない場合は、
    // 設定を既定値に戻します。
    if (!this.#graph.zFeatureLabelList.includes(
      this.#settings.colorFeature
    )) {
      this.#settings.colorFeature = defaultColorFeatureLabel;
      // GUI に反映させます。
      this.#colorFeatureController.updateDisplay();
    }
    if (!this.#graph.zFeatureLabelList.includes(
      this.#settings.pointsColorFeature
    )) {
      this.#settings.pointsColorFeature = defaultColorFeatureLabel;
      // GUI に反映させます。
      this.#pointsColorFeatureController.updateDisplay();
    }

    // グラフに存在する特徴量の種類を GUI のオプションに反映します。
    this.#zFeatureController = this.#zFeatureController.
      options(this.#graph.zFeatureLabelList).
      name("Feature").onFinishChange(this.#handleZFeatureTypeChange);
    this.#colorFeatureController = this.#colorFeatureController.
      options(this.#graph.zFeatureLabelList).
      name("Feature").onFinishChange(this.#handleColorFeatureChange);
    this.#pointsColorFeatureController = this.#pointsColorFeatureController.
      options(this.#graph.zFeatureLabelList).
      name("Feature").onFinishChange(this.#handlePointsColorFeatureChange);

    // 座標を設定します。
    // グラフの x、y、z 座標を取得します。
    const xyArray = this.#graph.xyArray;
    const zArray = this.#graph.zArray;
    // z 軸のスケールです。
    const zScale = this.#settings.zScale;

    // x と y の最大値と最小値を取得します。
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    // 各ノードを 3 次元ベクトルに変換し、
    // そのベクトル群をジオメトリに設定します。
    const points3d = [];
    for (let i = 0; i < this.#graph.nNode; i++) {
      const [x, y] = xyArray[i];
      // 3D ベクトルを設定します。
      points3d.push(new THREE.Vector3(x, y, zArray[i] * zScale));
      // x, y の最大値と最小値を取得します。
      if (minX > x) minX = x;
      if (minY > y) minY = y;
      if (maxX < x) maxX = x;
      if (maxY < y) maxY = y;
    }
    this.#geomSurface.setFromPoints(points3d);
    this.#geom.setFromPoints(points3d);

    // グリッドを更新します。
    this.#gridHelper = new GridSegments(minX, minY, maxX, maxY);

    // 点の数がそれまでのデータと異なった場合に備えて、
    // ジオメトリの normal 属性を削除しておきます。
    // (しないと ジオメトリの computeVertexNormals メソッドで
    //  既存の normal 属性の配列がサイズ変更されないまま使いまわされます。)
    this.#geomSurface.deleteAttribute("normal");
    this.#geom.deleteAttribute("normal");

    // 三角形分割を設定します。
    this.#updateGeomIndex();
    this.#updateGeomDrawRange();

    // グリッドを設定に応じて表示します。
    this.#updateGridVisibility();

    // 選択されている細胞があればクリアします。
    this.#selectedCellList = [];
    this.#handleSelectionChange();

    // アノテーションを作成、表示します。
    // それまでに作成されているアノテーションがあれば削除します。
    this.#deleteAnnotations();
    this.#createAnnotations();
    this.#updateAnnotationPositionWorld();
    if (this.#settings.showAnnotations) {
      this.#updateAnnotationPositionScreen();
    }
    this.#updateAnnotationVisibility();

    // 色を設定します。
    this.#geomSurface.setAttribute("color", new THREE.BufferAttribute(
      new Float32Array(this.#graph.nNode * 3), 3
    ));
    this.#geom.setAttribute("color", new THREE.BufferAttribute(
      new Float32Array(this.#graph.nNode * 3), 3
    ));
    this.#updateColorMinMaxToNewFeature();
    this.#colorMinController.updateDisplay();
    this.#colorMaxController.updateDisplay();
    this.#updatePointsColorMinMaxToNewFeature();
    this.#pointsColorMinController.updateDisplay();
    this.#pointsColorMaxController.updateDisplay();
    this.#handleColorMapChange();

    // コールバックします。
    this.onLoaded();
  }

  /**
   * アノテーションを表すオブジェクトと、該当する HTML 要素を削除します。
   *
   * @memberof Viewer
   */
  #deleteAnnotations = () => {

    // 各アノテーションごとに処理します。
    for (const annotationObj of this.#annotationObjList) {

      annotationObj.element.remove();
    }

    // リストを空にします。
    this.#annotationObjList = [];
  }

  /**
   * 読み込まれている細胞地図のグラフのデータに基づき、  
   * ・アノテーションを表すオブジェクトを作成します。  
   * ・表示用の HTML 要素を作成し、親要素に追加します。
   *
   * @memberof Viewer
   */
  #createAnnotations = () => {

    // 各アノテーションごとに処理します。
    for (const annotation of this.#graph.annotationSet) {

      // 要素を作成し、表記とスタイルを設定します。
      const labelElem = document.createElement("div");
      labelElem.textContent = annotation;
      labelElem.style.cursor = "pointer";
      labelElem.style.fontFamily = this.#fontFamily;
      labelElem.style.backgroundColor = "#ffffffcc";
      labelElem.style.fontSize = this.#settings.annotationFontSize + "px";
      labelElem.style.padding = "2px 4px";
      labelElem.style.display = "flex";
      labelElem.style.position = "absolute";
      this.parentElement.appendChild(labelElem);
      // 親要素の左上と、この要素の中心を合わせます。
      // ※座標の指定は appendChild 以降である必要があります。
      const width = labelElem.offsetWidth;
      const height = labelElem.offsetHeight;
      labelElem.style.left = (-0.5 * width).toFixed(0) + "px";
      labelElem.style.top = (-0.5 * height).toFixed(0) + "px";

      // 右クリックとホイール操作を無効にします。
      labelElem.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
      labelElem.addEventListener("wheel", (event) => {
        event.preventDefault();
      });
      // クリックされたときにそのアノテーションの細胞が
      // 選択されるようにします。
      labelElem.addEventListener("click", (event) => {

        // そのアノテーションに属する細胞群です。
        const annotatedCellList = this.#graph.getCellsAnnotated(annotation);
        // Shift キーなどが同時に押されていた場合は
        // それまでの選択対象に追加します。
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
          this.#addSelection(annotatedCellList);
        }
        // それ以外の場合はそれまでの選択対象を無視します。
        else {
          this.#selectedCellList = annotatedCellList;
        }
        this.#handleSelectionChange();
      });

      // アノテーションの情報を管理するためのオブジェクトをリストに追加します。
      this.#annotationObjList.push(
        { annotation: annotation, element: labelElem }
      );
    }

    // 背景色を設定します。
    // this.#updateAnnotationBgColor();
  }

  /**
   * アノテーションの背景色を更新します。
   */
  #updateAnnotationBgColor = () => {

    // 設定された背景色を取得します。
    var bgColor = this.#settings.bgColor;
    var color = new THREE.Color(
      bgColor[0] / 255.0,
      bgColor[1] / 255.0,
      bgColor[2] / 255.0);

    // 背景色を半透明にします。
    var hexColor = "#" + color.getHexString() + "a0";

    // アノテーションに反映します。
    for (const annotationObj of this.#annotationObjList) {
      annotationObj.element.style.backgroundColor = hexColor;
    }
  }

  /**
   * アノテーションのラベルを表示します。
   *
   * @memberof Viewer
   */
  #showAnnotations = () => {

    for (const annotationObj of this.#annotationObjList) {
      annotationObj.element.style.display = "flex";
    }
  }

  /**
   * アノテーションのラベルを非表示にします。
   *
   * @memberof Viewer
   */
  #hideAnnotations = () => {

    for (const annotationObj of this.#annotationObjList) {
      annotationObj.element.style.display = "none";
    }
  }

  /**
   * 現在の設定や読み込まれているグラフに基づいて
   * ColorMap オブジェクトを作り直します。
   *
   * @memberof Viewer
   */
  #renewColorMapObject = () => {

    this.#colorMap = new ColorMap(
      this.#settings.colorMap,
      this.#settings.colorMin, this.#settings.colorMax
    );
    this.#pointsColorMap = new ColorMap(
      this.#settings.pointsColorMap,
      this.#settings.pointsColorMin, this.#settings.pointsColorMax
    );
  }

  /**
   * 選択中の細胞を表す点群のジオメトリを更新します。
   *
   * @memberof Viewer
   */
  #updateSelectionGeom = () => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 選択中の細胞を強調表示するためのジオメトリを作成します。

    // 全細胞のジオメトリの座標配列を取り出します。
    const allPositions = this.#geom.getAttribute("position").array;
    // 座標配列中のインデックスを格納する変数です。
    let iInAllPositions = 0;
    // 選択中の細胞の座標ベクトルを格納する配列です。
    const points3d = [];
    // x、y、z 座標を格納するための変数です。
    let x = 0;
    let y = 0;
    let z = 0;

    // 選択中の細胞をループします。
    for (const cellIdx of this.#selectedCellList) {

      // 各細胞の座標ベクトルを配列に格納します。
      iInAllPositions = cellIdx * 3;
      x = allPositions[iInAllPositions];
      y = allPositions[iInAllPositions + 1];
      z = allPositions[iInAllPositions + 2];
      points3d.push(new THREE.Vector3(x, y, z));
    }

    // ベクトル配列からジオメトリを更新します。
    this.#selectedCellGeom.setFromPoints(points3d);
    this.#selectedCellGeom.computeVertexNormals();
    this.#selectedCellGeom.computeBoundingBox();
    this.#selectedCellGeom.computeBoundingSphere();
  }

  /**
   * 設定に従い、地図の表面を表すメッシュの表示/非表示を切り替えます。
   *
   * @memberof Viewer
   */
  #updateSurfaceVisibility = () => {

    // 表示する場合で、シーンにメッシュが属していなければシーンに追加します。
    if (
      this.#settings.showSurface &&
      !this.#scene.children.includes(this.#mesh)
    ) {
      this.#scene.add(this.#mesh);
    }
    else if (
      !this.#settings.showSurface &&
      this.#scene.children.includes(this.#mesh)
    ) {
      this.#scene.remove(this.#mesh);
    }

    // カラーバーの表示、非表示を連動させます。
    this.#updateColorBarVisibility();
  }

  /**
   * 設定に従い、全細胞を表す点群の表示/非表示を切り替えます。
   *
   * @memberof Viewer
   */
  #updateCellPointsVisibility = () => {

    // 表示する場合で、シーンに点群が属していなければシーンに追加します。
    if (
      this.#settings.showCellPoints &&
      !this.#scene.children.includes(this.#cellPoints)
    ) {
      this.#scene.add(this.#cellPoints);
    }
    // 表示しない場合で、シーンに点群が属していればシーンから削除します。
    else if (
      !this.#settings.showCellPoints &&
      this.#scene.children.includes(this.#cellPoints)
    ) {
      this.#scene.remove(this.#cellPoints);
    }

    // カラーバーの表示、非表示を連動させます。
    this.#updateColorBarVisibility();
  }

  /**
   * 設定に従い、選択中の細胞の強調表示の有無を切り替えます。
   *
   * @memberof Viewer
   */
  #updateSelectionVisibility = () => {

    // 表示する場合で、シーンに点群が属していなければシーンに追加します。
    if (
      this.#settings.highlightSelection &&
      !this.#scene.children.includes(this.#selectedCellPoints)
    ) {
      this.#scene.add(this.#selectedCellPoints);
    }
    // 表示しない場合で、シーンに点群が属していればシーンから削除します。
    else if (
      !this.#settings.highlightSelection &&
      this.#scene.children.includes(this.#selectedCellPoints)
    ) {
      this.#scene.remove(this.#selectedCellPoints);
    }
  }

  /**
   * 設定に従い、グリッド表示の有無を切り替えます。
   *
   * @memberof Viewer
   */
  #updateGridVisibility = () => {

    // グリッド未作成の場合はなにもしません。
    if (!this.#gridHelper) return;

    // 表示する場合で、シーンにグリッドが属していなければシーンに追加します。
    if (
      this.#settings.showGrid &&
      !this.#scene.children.includes(this.#gridHelper)
    ) {
      this.#scene.add(this.#gridHelper);
    }
    // 表示しない場合で、シーンにグリッドが属していればシーンから削除します。
    else if (
      !this.#settings.showGrid &&
      this.#scene.children.includes(this.#gridHelper)
    ) {
      this.#scene.remove(this.#gridHelper);
    }
  }

  /**
   * 設定に従い、グラフの三角形分割の三角形を除去する閾値の種類と値を
   * 変更します。
   *
   * @memberof Viewer
   */
  #updateGraphThreshTypeAndPercent = () => {

    // 表示するデータがない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    this.#graph.setThreshTypeAndPercent(
      this.#settings.threshType, this.#settings.threshPercent
    );
  }

  /**
   * 設定に従い、グラフの三角形分割の三角形を除去する閾値を変更します。
   *
   * @memberof Viewer
   */
  #updateGraphThreshPercent = () => {

    // 表示するデータがない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    this.#graph.triangleThreshPercent = this.#settings.threshPercent;
  }

  /**
   * 細胞地図のジオメトリのインデックスに
   * 閾値の種類でソートされた三角形分割を設定します。
   *
   * @memberof Viewer
   */
  #updateGeomIndex = () => {

    // 表示するデータがない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    this.#geomSurface.setIndex(
      new THREE.BufferAttribute(this.#graph.sortedTriangles, 1)
    );
    this.#geomSurface.computeVertexNormals();
    this.#geomSurface.computeBoundingBox();
    this.#geomSurface.computeBoundingSphere();
    this.#geom.computeVertexNormals();
    this.#geom.computeBoundingBox();
    this.#geom.computeBoundingSphere();
  }

  /**
   * 細胞地図のジオメトリの三角形の描画範囲に、
   * 閾値による除去の結果残った三角形分割の数を設定します。
   *
   * @memberof Viewer
   */
  #updateGeomDrawRange = () => {

    // 表示するデータがない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    this.#geomSurface.setDrawRange(0, 3 * this.#graph.nEnabledTriangles)
  }

  /**
   * 設定に従い、グラフで z 座標に用いる特徴量を変更します。
   *
   * @memberof Viewer
   */
  #updateGraphZFeature = () => {

    // 表示するデータがない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    this.#graph.zFeatureType = this.#settings.zFeature;
  }

  /**
   * z 座標に用いる特徴量の種類を表す文字列を取得します。
   *
   * @memberof Viewer
   */
  get zFeatureType() {
    return this.#settings.zFeature;
  }

  /**
   * 設定に従い、選択中の細胞を結ぶ経路の表示を最新の状態に更新します。
   *
   * @memberof Viewer
   */
  #updatePath = () => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 表示されている経路があれば取り除きます。
    if (this.#scene.children.includes(this.#pathLineMesh)) {
      this.#scene.remove(this.#pathLineMesh);
    }

    // 経路表示中フラグがオフであれば、終了します。
    if (!this.#isShowingPath) {
      return;
    }

    // 経路表示中フラグがオンであれば、選択されている細胞を結ぶ経路を表示します。
    // 選択中の細胞のジオメトリを使用して経路の辺を強調表示し、シーンに追加します。
    const meshLine = new MeshLine();
    meshLine.setGeometry(this.#selectedCellGeom);
    this.#pathLineMesh = new THREE.Mesh(meshLine, this.#pathLineMaterial);
    this.#scene.add(this.#pathLineMesh);
  }

  /**
   * 設定に従い、細胞地図のジオメトリの z 座標を更新します。
   *
   * @memberof Viewer
   */
  #updateGeomZ = () => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 更新の対象となる、ジオメトリの座標配列です。
    const positions = this.#geom.getAttribute("position").array;
    const surfacePositions = this.#geomSurface.getAttribute("position").array;

    // 更新に用いる、グラフの特徴量です。
    const zFeature = this.#graph.zArray;

    // ジオメトリの z 座標を更新します。
    let iZPosition = 0;
    const scale = this.#settings.zScale;
    for (let i = 0; i < zFeature.length; i++) {
      iZPosition = 3 * i + 2;
      positions[iZPosition] = zFeature[i] * scale;
      surfacePositions[iZPosition] = zFeature[i] * scale;
    }
    this.#geomSurface.getAttribute("position").needsUpdate = true;
    this.#geomSurface.computeVertexNormals();
    this.#geomSurface.computeBoundingBox();
    this.#geomSurface.computeBoundingSphere();
    this.#geom.getAttribute("position").needsUpdate = true;
    this.#geom.computeVertexNormals();
    this.#geom.computeBoundingBox();
    this.#geom.computeBoundingSphere();

    // 選択中の細胞があればその z 座標を反映した
    // 新しい選択中細胞用ジオメトリに更新します。
    this.#updateSelectionGeom();

    // 表示中の経路があれば更新します。
    this.#updatePath();
  }

  /**
   * 設定に従い、細胞地図の着色を変更します。
   *
   * @memberof Viewer
   */
  #updateGeomColor = () => {

    // データが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // 着色用の特徴量をジオメトリの各頂点の色に反映させます。

    // 使用する特徴量です。
    const colorFeature = this.#graph.getZFeatureArrayByName(
      this.#settings.colorFeature
    );
    const pointsColorFeature = this.#graph.getZFeatureArrayByName(
      this.#settings.pointsColorFeature
    );

    // 設定対象の、ジオメトリの各頂点の RGB を表す配列です。
    const colors = this.#geom.getAttribute("color").array;
    const surfaceColors = this.#geomSurface.getAttribute("color").array;
    // 設定対象の配列におけるインデックスを代入するための変数です。
    let iColors = 0;

    // // アノテーションの文字色を更新するための辞書を作成します。
    // // 各アノテーションに属する細胞の数、特徴量の合計を記録する辞書です。
    // const countDict = {};
    // const featureSumDict = {};
    // for (const annotation of this.#graph.annotationSet) {
    //   countDict[annotation] = 0;
    //   featureSumDict[annotation] = 0;
    // }

    // 各細胞の特徴量をループしつつ、ジオメトリの色配列を更新します。
    for (let i = 0; i < colorFeature.length; i++) {

      // 色配列を更新します。
      iColors = 3 * i;
      [surfaceColors[iColors], surfaceColors[iColors + 1], surfaceColors[iColors + 2]] =
        this.#colorMap.get0to1RgbAgainstMinMax(colorFeature[i]);
    }
    for (let i = 0; i < pointsColorFeature.length; i++) {

      // 色配列を更新します。
      iColors = 3 * i;
      [colors[iColors], colors[iColors + 1], colors[iColors + 2]] =
        this.#pointsColorMap.get0to1RgbAgainstMinMax(pointsColorFeature[i]);

      // // アノテーションごとに特徴量の合計を算出します。
      // const annotation = this.#graph.annotationArray[i];
      // countDict[annotation]++;
      // featureSumDict[annotation] += colorFeature[i];
    }

    this.#geom.getAttribute("color").needsUpdate = true;
    this.#geomSurface.getAttribute("color").needsUpdate = true;

    // // 各アノテーションの平均 x、y、z 座標の情報を登録します。
    // for (const annotationObj of this.#annotationObjList) {

    //   const annotation = annotationObj.annotation;
    //   const z = featureSumDict[annotation] / countDict[annotation];
    //   // z 座標の値から文字色を設定します。
    //   const color = new THREE.Color().fromArray(
    //     this.#colorMap.get0to1RgbAgainstMinMax(z));
    //   annotationObj.element.style.color = "#" + color.getHexString();
    // }
  }

  /**
   * 着色用の特徴量の変更に合わせて、カラー マップの最小値と最大値と
   * それらの既定値を更新します。
   *
   * @memberof Viewer
   */
  #updateColorMinMaxToNewFeature = () => {

    // データが読み込まれていない場合には何もしません。
    if (this.#graph === null) {
      return;
    }

    // 更新前のカラー マップの最小値と最大値とその既定値を記録しておきます。
    const oldMin = this.#settings.colorMin;
    const oldMax = this.#settings.colorMax;
    const oldMinDefault = this.#settings.colorMinDefault;
    const oldMaxDefault = this.#settings.colorMaxDefault;
    const oldRangeDefault = (
      oldMinDefault === oldMaxDefault ?
        Number.MIN_VALUE :
        oldMaxDefault - oldMinDefault
    );

    // 特徴量の最小値と最大値を、カラー マップの最小値と最大値の既定値とします。
    const feature = this.#graph.getZFeatureArrayByName(
      this.#settings.colorFeature
    );
    const getMin = (a, b) => Math.min(a, b);
    const getMax = (a, b) => Math.max(a, b);
    const newMinDefault = feature.reduce(getMin);
    const newMaxDefault = feature.reduce(getMax);

    const newMin = normalizeToNewFeature.call(this, oldMin);
    const newMax = normalizeToNewFeature.call(this, oldMax);

    this.#settings.colorMin = newMin;
    this.#settings.colorMax = newMax;
    this.#settings.colorMinDefault = newMinDefault;
    this.#settings.colorMaxDefault = newMaxDefault;

    function normalizeToNewFeature(number) {
      return (
        newMinDefault +
        (
          (newMaxDefault - newMinDefault) * (number - oldMinDefault) /
          (oldRangeDefault)
        )
      );
    }
  }
  #updatePointsColorMinMaxToNewFeature = () => {

    // データが読み込まれていない場合には何もしません。
    if (this.#graph === null) {
      return;
    }

    // 更新前のカラー マップの最小値と最大値とその既定値を記録しておきます。
    const oldMin = this.#settings.pointsColorMin;
    const oldMax = this.#settings.pointsColorMax;
    const oldMinDefault = this.#settings.pointsColorMinDefault;
    const oldMaxDefault = this.#settings.pointsColorMaxDefault;
    const oldRangeDefault = (
      oldMinDefault === oldMaxDefault ?
        Number.MIN_VALUE :
        oldMaxDefault - oldMinDefault
    );

    // 特徴量の最小値と最大値を、カラー マップの最小値と最大値の既定値とします。
    const feature = this.#graph.getZFeatureArrayByName(
      this.#settings.pointsColorFeature
    );
    const getMin = (a, b) => Math.min(a, b);
    const getMax = (a, b) => Math.max(a, b);
    const newMinDefault = feature.reduce(getMin);
    const newMaxDefault = feature.reduce(getMax);

    const newMin = normalizeToNewFeature.call(this, oldMin);
    const newMax = normalizeToNewFeature.call(this, oldMax);

    this.#settings.pointsColorMin = newMin;
    this.#settings.pointsColorMax = newMax;
    this.#settings.pointsColorMinDefault = newMinDefault;
    this.#settings.pointsColorMaxDefault = newMaxDefault;

    function normalizeToNewFeature(number) {
      return (
        newMinDefault +
        (
          (newMaxDefault - newMinDefault) * (number - oldMinDefault) /
          (oldRangeDefault)
        )
      );
    }
  }

  /**
   * 2 本のカラーバーを更新します。
   * 
   * @memberof Viewer
   */
  #updateColorBars = () => {

    this.#updateColorBarDisplay("Surface", this.#colorBarBoxSurface, this.#colorMap);
    this.#updateColorBarDisplay("Cells", this.#colorBarBoxPoints, this.#pointsColorMap);
  }

  /**
   * 2 本のカラーバーの可視化状態を更新します。
   * 
   * @memberof Viewer
   */
  #updateColorBarVisibility = () => {

    this.#colorBarBoxSurface.style.display = this.#settings.showSurface ? "flex" : "none";
    this.#colorBarBoxPoints.style.display = this.#settings.showCellPoints ? "flex" : "none";
  }

  /**
   * 設定に従い、カラー バーの表示を更新します。
   *
   * @memberof Viewer
   */
  #updateColorBarDisplay = (barName, colorBarBox, colorMap) => {

    // カラー バー表示領域をクリアします。
    while (colorBarBox.firstChild) {
      colorBarBox.removeChild(colorBarBox.firstChild);
    }

    // カラーバー名を表示するためのボックス要素です。
    const name = document.createElement("div");
    name.style.position = "absolute";
    name.style.top = "0";
    name.style.left = "10px";
    name.style.margin = "3px";
    name.style.padding = "2px 4px";
    name.style.backgroundColor = "#00000060";
    name.innerText = barName;
    colorBarBox.appendChild(name);

    // カラー バーを描画します。
    // 長方形で、上から下にかけてカラー マップの 1 ～ 0 に対応する色を設定します。

    // 描画のためのキャンバス要素を用意します。
    const colorBarCanvas = document.createElement("canvas");
    colorBarCanvas.width = 16;
    colorBarCanvas.height = 200;
    colorBarCanvas.style.border = "1px solid white";
    colorBarCanvas.style.margin = "40px 0 8px 8px";
    colorBarBox.appendChild(colorBarCanvas);

    // キャンバス要素の各ピクセルの色を設定します。

    // 設定対象を取得します。
    const context = colorBarCanvas.getContext("2d");
    const imageData = context.getImageData(
      0, 0, colorBarCanvas.width, colorBarCanvas.height
    );

    const width = imageData.width;
    const height = imageData.height;

    // キャンバス内での相対的な高さを格納する変数です。
    let relativeHeight = 0;

    // RGB の値を格納する変数です。
    let r = 0, g = 0, b = 0;

    // キャンバスの縦の座標ごとにカラー マップから RGB を求めます。
    for (let y = 0; y < height; y++) {

      relativeHeight = 1 - (y / (height - 1));
      [r, g, b] = colorMap.get8bitRgbFrom0to1Number(relativeHeight);

      // 縦の座標が同じピクセルの色を設定します。
      for (let x = 0; x < width; x++) {
        const base = (width * y + x) * 4;
        imageData.data[base] = r;
        imageData.data[base + 1] = g;
        imageData.data[base + 2] = b;
        imageData.data[base + 3] = 255;
      }
    }

    // 設定した色を反映させます。
    context.putImageData(imageData, 0, 0);

    // 以上でカラーバーの描画は終わりです。

    // カラーバーの上端と下端が表す値を表示するためのボックス要素です。
    const axisBox = document.createElement("div");
    axisBox.style.position = "relative";
    axisBox.style.paddingLeft = "4px";
    colorBarBox.appendChild(axisBox);

    // カラーバーが示す特徴量の最大値と最小値を取得します。

    // カラーバーが示す最大値を表示するためのボックス要素です。
    const maxBox = document.createElement("div");

    maxBox.style.position = "absolute";
    maxBox.style.top = "27px";
    maxBox.style.padding = "2px 4px";
    maxBox.style.backgroundColor = "#00000060";
    maxBox.innerText = colorMap.max.toExponential(2);
    axisBox.appendChild(maxBox);

    // カラーバーが示す最小値を表示するためのボックス要素です。
    const minBox = document.createElement("div");
    minBox.style.position = "absolute";
    minBox.style.bottom = "0";
    minBox.style.padding = "2px 4px";
    minBox.style.backgroundColor = "#00000060";
    minBox.innerText = colorMap.min.toExponential(2);
    axisBox.appendChild(minBox);
  }

  /**
   * シーンの背景色を変更します。
   *
   * @memberof Viewer
   */
  #updateSceneBgColor = () => {

    this.#scene.background.r = this.#settings.bgColor[0] / 255.0;
    this.#scene.background.g = this.#settings.bgColor[1] / 255.0;
    this.#scene.background.b = this.#settings.bgColor[2] / 255.0;

    // アノテーションの背景色も更新します。
    // this.#updateAnnotationBgColor();
  }

  /**
   * アノテーションのワールド座標 (平均位置) の情報を更新します。
   *
   * @memberof Viewer
   */
  #updateAnnotationPositionWorld = () => {

    // グラフが読み込まれていない場合は何もしません。
    if (this.#graph === null) {
      return;
    }

    // アノテーションがグラフにない場合は何もしません。
    if (this.#graph.annotationArray === null) {
      return;
    }

    // 各アノテーションに属する細胞の数、x、y、z 座標の合計を記録する辞書です。
    const countDict = {};
    const xSumDict = {};
    const ySumDict = {};
    const zSumDict = {};
    for (const annotation of this.#graph.annotationSet) {

      countDict[annotation] = 0;
      xSumDict[annotation] = 0;
      ySumDict[annotation] = 0;
      zSumDict[annotation] = 0;
    }

    // x、y、z 座標を取得する元となる配列です。
    const positions = this.#geom.getAttribute("position").array;

    // 各細胞をループして、
    // 各アノテーションに属する細胞をカウントするとともに、
    // x、y、z 座標を足し上げていきます。
    for (let i = 0; i < this.#graph.nNode; i++) {

      const annotation = this.#graph.annotationArray[i];
      countDict[annotation]++;
      xSumDict[annotation] += positions[3 * i];
      ySumDict[annotation] += positions[3 * i + 1];
      zSumDict[annotation] += positions[3 * i + 2];
    }

    // 各アノテーションの平均 x、y、z 座標の情報を登録します。
    for (const annotationObj of this.#annotationObjList) {

      const annotation = annotationObj.annotation;
      const x = xSumDict[annotation] / countDict[annotation];
      const y = ySumDict[annotation] / countDict[annotation];
      const z = zSumDict[annotation] / countDict[annotation];
      annotationObj.worldPosition = new THREE.Vector3(x, y, z);
    }
  }

  /**
   * アノテーションのラベルのスクリーン上の位置を、
   * アノテーションのワールド座標に基づき更新します。
   *
   * @memberof Viewer
   */
  #updateAnnotationPositionScreen = () => {

    // update メソッドを呼ばないとラベル位置が正しく計算されません。
    this.#controls.update();

    // キャンバスの幅と高さの半分の値を取得します。
    const halfWidth = 0.5 * this.#canvas.clientWidth;
    const halfHeight = 0.5 * this.#canvas.clientHeight;

    // 各アノテーションの情報をループします。
    for (const annotationObj of this.#annotationObjList) {

      // ワールド座標をコピーして、スクリーン座標に変換します。
      const projection = annotationObj.worldPosition.clone().project(
        this.#camera
      );
      const screenX = halfWidth * (projection.x + 1.0);
      const screenY = halfHeight * (-projection.y + 1.0);

      // アノテーション表示用の要素の位置に設定します。
      annotationObj.element.style.transform =
        `translate(${screenX}px, ${screenY}px)`;
    }
  }

  /**
   * 設定に従い、アノテーションの表示/非表示を切り替えます。
   * 
   *
   * @memberof Viewer
   */
  #updateAnnotationVisibility = () => {

    // 表示する場合です。
    if (this.#settings.showAnnotations) {
      this.#showAnnotations();
    }
    // 非表示にする場合です。
    else {
      this.#hideAnnotations();
    }
  }

  /**
   * 設定に従ってアノテーションのフォント サイズを更新します。
   */
  #updateAnnotationFontSize = () => {

    for (const annotationObj of this.#annotationObjList) {
      annotationObj.element.style.fontSize = this.#settings.annotationFontSize + "px";
    }
  }

  /**
   * 設定に従い、ドラッグの挙動を更新します。
   *
   * @memberof Viewer
   */
  #updateDragAction = () => {

    switch (this.#settings.dragAction) {
      case cameraRotationLabel:
        this.#controls.noRotate = false;
        break;
      case rectangleSelectionLabel:
        this.#controls.noRotate = true;
        break;
      default:
        // ここには到達しないはずですが、到達した場合はわかるように例外を投げます。
        throw invalidDragActionError(this.#settings.dragAction);
    }
  }
}
