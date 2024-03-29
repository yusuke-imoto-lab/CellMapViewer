# CellMap Viewer
CellMap Viewer is a Web application for 3D-visualization of a cell map (cell differentiation landscape). It reads cell data including coordinates and features from a CSV-formatted text file, computes Delaunay triangulations, and displays the result.

<p><a href="https://yusuke-imoto-lab.github.io/CellMapViewer/CellMapViewer/viewer.html" target="_blank">Run CellMapViewer</a></p>

* Sample dataset is available [here](https://www.dropbox.com/s/aqjrpeos4auvycy/CellMap_hippocampus.csv?dl=1). 
* Input data can be created by *[CellMap (landscape inference method)](https://github.com/yusuke-imoto-lab/CellMap)*. 

<div style="text-align:left"><img style="width:100%; height: auto" src="https://github.com/yusuke-imoto-lab/CellMapViewer/blob/main/Images/TopImage.png"/></div>

<h1>Manual</h1>
<p>Last updated: August 26th, 2022</p>
<a href="https://yusuke-imoto-lab.github.io/CellMapViewer/CellMapViewer/manual_ja.html">Japanese</a>

<h2>Table of contents</h2>
<ul>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#user-interface">User interface</a></li>
    <li><a href="#input-file-format">Input file format</a></li>
    <li><a href="#how-to-visualize">Visualizing your cell map data</a></li>
    <li><a href="#how-to-read">Reading a cell map</a></li>
    <li><a href="#algorithm">Algorithm for visualization</a></li>
    <li><a href="#configuration">Configuring visualization</a></li>
    <li><a href="#control-viewpoint">Controlling the viewpoint</a></li>
    <li><a href="#selecting-cells">Selecting cells</a></li>
    <li><a href="#finding-path">Finding a path</a></li>
    <li><a href="#screenshot">Taking a screenshot</a></li>
</ul>


<h2 id="overview">Overview</h2>
<p class="no-indent">CellMapViewer is a Web application for 3D-visualization of a cell map. It reads cell data including coordinates and features from a CSV-formatted text file, computes Delaunay triangulations, and displays the result.</p>
<p class="en-indent">Once displayed, you can:</p>
<ul>
    <li>control the viewpoint with the mouse;</li>
    <li>select cells with the mouse;</li>
    <li>display contours, mesh, and streamlines;</li>
    <li>find the shortest path between two points, and draw chart for feature values on the path;</li>
    <li>save a screenshot in PNG format;</li>
    <li>save data of selected cells as a CSV-formatted text file;</li>
    <li>save and load the configure file; and</li>
    <li>load cell data automatically.</li>
</ul>
<p class="en-indent">In addition, via the GUI menu, you can configure:</p>
<ul>
    <li>triangles to remove from the triangulation;</li>
    <li>the <em>z</em> axis feature;</li>
    <li>the annotation feature;</li>
    <li>the streamlines feature;</li>
    <li>the coloring of the surface, the cells, the contours, the mesh and the background;</li>
    <li>the cell point size and the width of path, contours, and mesh;</li>
    <li>the visibility of the annotations, the surface, the cell points (display ratio), the contours, the mesh, the stremlines, and the grid; and</li>
    <li>whether to highlight the selected cells.</li>
</ul>
<p class="en-indent">Furthermore, it automatically shows the information of the selected cells, including the coordinates and the features, as well as statistics such as mean.</p>


<h2 id="user-interface">User interface</h2>
<img class="figure" style="width: 618px; height: 607px;" src="CellMapViewer/img/whole_gui.png">
<h3 id="links-to-manuals">(1) Links to the manuals and sample data</h3>
<p class="en-indent">English- and Japanese-versions are available.</p>
<h3 id="file-selection-area">(2) File selection area</h3>
<p class="en-indent">When clicked, the file dialog is shown to select the input file. You can also drag and drop the input file here. When visualizing data, the file name is shown above this area.</p>
<h3 id="menu">(3) Menu</h3>
<p class="en-indent">The menu for configurations and operations. For details, see <a href="#configuration">"Configuring visualization"</a> for [Threshold], [Z-axis], [Color], [Size], [View], [Config], [Drag action] and [Rotation], <a href="#control-viewpoint">"Controlling the viewpoint"</a> for [Reset camera], <a href="#finding-path">"Finding a path"</a> for [Finding 2D (3D) path], and <a href="#screenshot">"Taking a screenshot"</a> for [Save image]. The menu can be closed (opened) by clicking [Close (Open) Controls].</p>
<h3 id="map-displayed-area">(4) Cell map-displayed area</h3>
<p class="en-indent">Can be controlled with the mouse. The height can be adjusted by dragging the right-bottom corner (not supported in Safari) or the horizontal line below. See <a href="#control-viewpoint">"Controlling the viewpoint"</a> for details.</p>
<h3 id="selected-cell-information">(5) Selected-cell information</h3>
<p class="en-indent">Displays the information and the statistics of the selected cells. The height can be adjusted by dragging the right-bottom corner. See <a href="#showing-of-information">"Showing of the selected cells' information"</a> for details. Clicking on the number of cells, displayed on the right of "Selected cells", saves the contents of the table in CSV format.</p>


<h2 id="input-file-format">Input file format</h2>
<p class="no-indent">The input file must:</p>
<ul>
    <li>be a text file;</li>
    <li>be encoded in UTF-8;</li>
    <li>be CSV-formatted using comma (",") as a delimiter;</li>
    <li>have the header describing the column names as the first line;</li>
    <li>describe each single cell data in each single line below the first one;</li>
    <li>have lines with the equal number of columns;</li>
    <li>have no redundancy in the column names;</li>
    <li>have cell names in the first column (header string is optional);</li>
    <li>have data columns for cell <em>x</em> coordinates, <em>y</em> coordinates, and potential from the second column onwards;</li>
    <li>have the header string 'X' in the data column for the cell's <em>x</em> coordinates;</li>
    <li>have the header string 'Y' in the data column for the cell's <em>y</em> coordinates;</li>
    <li>have the header string 'Potential' in the data column for the cell's potential;</li>
    <li>contain 0 or more cell annotation data columns;</li>
    <li>have the header string for the cell's annotation in the format of 'Annotation' or 'Annotation_', 'Annote_', 'Ann_' or 'A_' followed by at least one alphanumeric character;</li>
    <li>contain 0 or more sets of velocity vector data, with 1 set of <em>x</em>-direction data and <em>y</em>-direction data;</li>
    <li>contain the velocity vector data column, the <em>x</em> direction data column and the <em>y</em> direction data column, side by side in that order;</li>
    <li>have the header string of data columns of velocity vectors in the form of 'label_x' and 'label_y';</li>
    <li>have finite numbers in the columns other than cell name and cell type; and</li>
    <li>have columns that do not match the above header strings as features (numerical values) that are candidates for <em>z</em> coordinates.</li>
</ul>
<p class="no-indent">If these requirements are not satisfied, the file will cause errors, be read incorrectly or be garbled. Empty lines and lines containing only whitespace characters are skipped. Column names are interpreted regardless of the characters' case and the presence of white spaces.</p>
<p class="no-indent">Also, by placing the contents of the input file, written in the specified format below, in the "initialData.js" file that is available in the js folder of this program, the input contents will be automatically visualized when the program starts. The format of the "initialData.js" file is as follows:</p>
<ul>
    <li>The first line is 'window.initialData = {'</li>
    <li>The second line is ' "fileName":"&lt;any file name&gt;" '</li>
    <li>The third and subsequent lines are ' "data": `Contents of input file (CSV-formatted string)` '</li>
    <li>The last line is '};'</li>
</ul>


<h2 id="how-to-visualize">Visualizing your cell map data</h2>
<p class="no-indent">Once the input file is selected via <a href="#file-selection-area">file selection area</a>, the data is automatically displayed based on the current settings.</p>


<h2 id="how-to-read">Reading a cell map</h2>
<img class="figure" style="width: 800px; height: 440px;" src="CellMapViewer/img/visualized_cell_map.png">
<h3 id="color-bar">(1) Color bar</h3>
<p class="en-indent">The color map with the maximum and the minimum values of the feature selected in <a href="#color">[Color]</a> &gt; <a href="#surface">[Surface]</a> and <a href="#color">[Color]</a> &gt; <a href="#cells">[Cells]</a>.</p>
<h3 id="cell-map">(2) Cell map</h3>
<p class="en-indent">The Delaunay triangulation excluding the triangles thresholded based on the <a href="#threshold">[Threshold]</a> settings. The surface color represents the feature value specified in <a href="#color">[Color]</a> &gt; <a href="#surface">[Surface]</a> &gt; [Feature] at the color map specified in <a href="#color">[Color]</a> &gt; <a href="#surface">[Surface]</a> &gt; [Color map] within the range specified in <a href="#color">[Color]</a> &gt; <a href="#surface">[Surface]</a> &gt; [Min]/[Max]. The cell points are displayed as the enlarged view below. Color of the cell points is specified as the same way in <a href="#color">[Color]</a> &gt; <a href="#cells">[Cells]</a>, independent from the <a href="#color">[Color]</a> &gt; <a href="#surface">[Surface]</a>.</p>
<img class="figure" style="width: 300px; height: 300px;" src="CellMapViewer/img/cell_points.png">
<h3 id="annotation-label">(3) Annotation</h3>
<p class="en-indent">If the input data contain "Annotation" column, <a href="#view">[View]</a> displays a list of "Annotation" columns that can be selected. If you specify the "Annotation" column, the annotation label will be displayed at the average position of the cell population belonging to each annotation. By clicking the label, you can select the cells with the annotation of the label. When the Shift, Ctrl (for Windows) or Command (for mac) key is pressed at the same time, the cells of the annotation are added to the already selected cells.</p>


<h2 id="algorithm">Algorithm for visualization</h2>
<ol>
    <li>Do Delaunay-triangulation for the cell points in the input data at the <em>xy</em> plane.</li>
    <li>Exclude specific triangles from the triangles that make up 1. The excluded triangles are the union of the set of triangles with the top <em>s</em>% of the volume and with the top <em>t</em>% of the longest edge. (where <em>s</em> and <em>t</em> are the values ​​set in <a href="#threshold">[Threshold]</a>)</li>
    <li>Let the <em>z</em> coordinates of the cell points be the feature values as specified in <a href="#z-axis">[Z-axis]</a> &gt; [Feature], and when displayed, scale the <em>z</em> coordinates to the scale as specified in <a href="#z-axis">[Z-axis]</a> &gt; [Scale].</li>
    <li>Colorize the surface and the cell points as described in <a href="#how-to-read">"Reading a cell map"</a>.</li>
</ol>


<h2 id="configuration">Configuring visualization</h2>
<p class="no-indent">The next figure shows the expanded menu.</p>
<img class="figure" style="width: 239px; height: 1041px;" src="CellMapViewer/img/opened_menu.png">
<p class="en-indent">The settings in the menu are described below.</p>
<h3 id="threshold">[Threshold]</h3>
<p class="en-indent">The threshold for the exclusion of the triangles in the Delaunay triangulation. See <a href="#algorithm">"Algorithm for visualization"</a> for details.</p>
<h3 id="z-axis">[Z-axis]</h3>
<p class="en-indent">The feature for the <em>z</em> coordinates of the cell points for [Feature], and its scale for [Scale]. [Grid] sets the <em>z</em> coordinates of the grid.</p>
<h3 id="color">[Color]</h3>
<h4 id="surface">[Surface]</h4>
<p class="en-indent">The coloring of the surface of the cell map. [Min]/[Max] can be set to the minimum/maximum value of [Feature] from [Set min/max to feature range] button. See <a href="#cell-map">"Reading a cell map"</a> for details.</p>
<h4 id="cells">[Cells]</h4>
<p class="en-indent">The coloring of the cell points, similar to the [Surface].</p>
<h4 id="mesh">[Mesh]</h4>
<p class="en-indent">The color picker for the mesh (the edges of the triangulated triangles) of the <a href="#cell-map">cell map</a>.</p>
<h4 id="streamline">[Streamline]</h4>
<p class="en-indent">The color picker for the streamlines of the <a href="#cell-map">cell map</a>.</p>
<h4 id="contour">[Contour]</h4>
<p class="en-indent">The color picker for the contours of the <a href="#cell-map">cell map</a>.</p>
<h4 id="background">[Background]</h4>
<p class="en-indent">The color picker for the background of the <a href="#map-displayed-area">cell map-displayed area</a>.</p>

<h3 id="size">[Size]</h3>
<h4 id="cell">[Annotation]</h4>
<p class="en-indent">The font size of the annotations.</p>
<h4 id="cell">[Cells]</h4>
<p class="en-indent">The size of the cell points.</p>
<h4 id="selection">[Selection]</h4>
<p class="en-indent">The size of the selected cell points.</p>
<h4 id="path-width">[Path width]</h4>
<p class="en-indent">The width of the path.</p>
<h4 id="contour-width">[Contour width]</h4>
<p class="en-indent">The width of the contours.</p>

<h3 id="view">[View]</h3>
<h4 id="annotation">[Annotation]</h4>
<p class="en-indent">Whether to display the label of the annotation.</p>
<h4 id="annotation">[Annotation type]</h4>
<p class="en-indent">Switches the annotation type.</p>   
<h4 id="surface-1">[Surface]</h4>
<p class="en-indent">Whether to display the surface and the corresponding color bar.</p>
<h4 id="surface-mesh-1">[Surface mesh]</h4>
<p class="en-indent">Whether to display the mesh.</p>
<h4 id="cell-1">[Cell]</h4>
<p class="en-indent">Whether to display the cell points and the corresponding color bar.</p>
<h4 id="highlight-selection">[Highlight selection]</h4>
<p class="en-indent">Whether to highlight the selected cell points.</p>
<h4 id="streamline">[Streamline]</h4>
<p class="en-indent">Whether to display the streamlines.</p>
<h4 id="velocity-type">[Velocity type]</h4>
<p class="en-indent">Switches the velocity type for displaying streamlines.</p>
<h4 id="contour">[Contour]</h4>
<p class="en-indent">Change the number of contours displayed.</p>
<h4 id="grid">[Grid]</h4>
<p class="en-indent">Whether to display the grid.</p>

<h3 id="drag-action">[Config]</h3>
<h4 id="initialize">[Initialize]</h4>
<p class="en-indent">Resets all the settings above to the default.</p>
<h4 id="load-config">[Load...]</h4>
<p class="en-indent">Displays the Open File dialog and loads the selected configuration file.</p>
<h4 id="save-config">[Save]</h4>
<p class="en-indent">Download the configuration file in JSON format.</p>

<h3 id="path">[Path]</h3>
<h4 id="find-2d-path">[Find 2D path]</h4>
<p class="en-indent">Search without considering the <em>z</em> coordinates. See "<a href="#finding-path">Finding a path</a>" for details.</p>
<h4 id="find-3d-path">[Find 3D path]</h4>
<p class="en-indent">Search considering the <em>z</em> coordinates. See "<a href="#finding-path">Finding a path</a>" for details.</p>
<h4 id="register">[Register for 3D path]</h4>
<p class="en-indent">Change the parameter for searching the path considering <em>z</em> coordinates. See "<a href="#finding-path">Finding a path</a>" for details.</p>

<h3 id="drag-action">[Drag action]</h3>
<p class="en-indent">The mode for the mouse drag with the left button down on the <a href="#map-displayed-area">cell map-displayed area</a>. See <a href="#control-viewpoint">"Controlling the viewpoint"</a> and <a href="#selection-by-drag">"Selection by drag"</a> for details.</p>

<h3 id="rotation">[Rotation]</h3>
<p class="en-indent">Specifies the center of the viewpoint when dragging while holding down the left mouse button at the <a href="#map-displayed-area">cell map-displayed area</a>. See <a href="#control-viewpoint">"Controlling the viewpoint"</a> and <a href="#selection-by-drag">"Selection by drag"</a> for details.</p>


<h2 id="control-viewpoint">Controlling the viewpoint</h2>
<p class="no-indent">You can rotate, zoom in/out and pan on the <a href="#map-displayed-area">cell map-displayed area</a> by the mouse. Click [Reset camera] to go back to the initial viewpoint.</p>
<h3 id="rotation">Rotation</h3>
<p class="en-indent">Set <a href="#drag-action">[Drag action]</a> to [Camera rotation] and drag with the left button down to rotate the viewpoint.</p>
<h3 id="zoom">Zoom</h3>
<p class="en-indent">Scroll to zoom in/out (with the mouse's scroll wheel or touch pad equivalent motion).</p>
<h3 id="pan">Pan</h3>
<p class="en-indent">Drag with the right button down to pan.</p>


<h2 id="selecting-cells">Selecting cells</h2>
<p class="no-indent">You can select cells by click or drag. Selected cells are highlighted in red as shown in the next figure.</p>
<img class="figure" style="width: 180px; height: 180px;" src="CellMapViewer/img/selected_cells.png">
<h3 id="selection-by-click">Selection by click</h3>
<p class="en-indent">When a cell point is clicked, the cell is selected and the others are deselected. When a cell is clicked with the Shift, Ctrl (for Windows) or Command (for mac) key pressed, the cell is added to the already selected cells.</p>
<h3 id="selection-by-drag">Selection by drag</h3>
<p class="en-indent">When dragged with <a href="#drag-action">[Drag action]</a> set to [Rectangle selection], the cells within the rectangle are selected and the others are deselected. When dragged with the Shift, Ctrl (for Windows) or Command (for mac) key pressed, the cells within the rectangle are added to the already selected cells.</p>
<h3 id="selection-by-annotation">Selection by annotation</h3>
<p class="en-indent">You can select cells by an annotation. See <a href="#annotation-label">"Annotation"</a> for details.</p>
<h3 id="showing-of-information">Showing of the selected cells' information</h3>
<p class="en-indent">The information of the selected cells are displayed in a table form in the <a href="#selected-cell-information">selected-cell information</a> area. The data in the input file such as coordinates and feature values are shown in one line for one cell. In addition, the following statistics of the selected cells is shown at the bottom of the table: minimum, maximum, mean, variance, standard deviation (SD) and coefficient of variation (CV).</p>


<h2 id="finding-path">Finding a path</h2>
<p class="no-indent">When two cell points are selected, you can find the shortest path between the points by [Path] commands. Searched edges are the ones that are currently drawn. The Euclidean distance on the <em>xy</em> plane is used. When the path is found, the path is shown in red and the cells on the path get selected. When a path is not found, a message is displayed in a dialog.</p>
<h3 id="path-regardless-z">Path search <em>regardless</em> of <em>z</em> coordinates</h3>
<p class="en-indent">Executed by clicking [Find 2D path]. The algorithm uses only <em>x</em> and <em>y</em> coordinates.</p>
<h3 id="path-regarding-z">Path search <em>regarding</em> <em>z</em> coordinates</h3>
<p class="en-indent">Executed by clicking [Find 3D path]. The algorithm tries to find the shortest path where the <em>z</em> coordinate monotonically increases or decreases. The search is performed using an algorithm that weights the search more heavily when the <em>z</em> coordinate increases than when the <em>z</em> coordinate decreases. The value of the register set in [Register for 3D path] is the value that controls the ratio of weights in decreasing and in increasing. Searching when the value of register is 0 is equivalent to <a href="#path-regardless-z">path search regardless of <em>z</em> coordinate</a>.
<p class="en-indent">If [Register for 3D path] is changed while the path is displayed, the value of register is changed and recalculated to display the newly obtained path. Even if the route being displayed is in a state where <a href="#path-regardless-z">path search regardless of <em>z</em> coordinate</a> was performed, the value of register is changed and <a href="#path-regarding-z">path search regarding of <em>z</em> coordinates</a> is performed.</p>
<p class="en-indent">When the path is found, a line chart with the selected cells on the horizontal axis and the selected feature on the vertical axis is displayed at the bottom of <a href="#selected-cell-information">the selected-cell information</a>, as shown in the figure below. The displayed feature can be changed dynamically by changing <a href="#z-axis">[Z-axis]</a> &gt; [Feature] while the graph is displayed.</p>
<img class="figure" style="width: 800px; height: 193px;" src="CellMapViewer/img/plot.png">


<h2 id="screenshot">Taking a screenshot</h2>
<p class="no-indent">You can save a screenshot of the <a href="#map-displayed-area">cell map-displayed area</a> excluding the menu area in PNG format by clicking [Save image].</p>