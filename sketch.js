var mapa;

var SEARCH_MODE = "NONE";

var hasFound = false;
var hasPrintedPath = false;
var targetCnt = 0;
var count = 0;
var inMenu = true;

var screenWidth = 800;
var screenHeight = 600;

// CAUTION! NEED TO BE A SQUARE!
var gridWidht = 40;
var gridHeight = 40;

function setup() {
  frameRate(60);
  createCanvas(screenWidth, screenHeight);
  background(50);
}

function keyPressed(){
  if(keyCode === ESCAPE && !inMenu){
    inMenu = true;
    hasFound = false;
    hasPrintedPath = false;
    targetCnt = 0;
    count = 0;
    SEARCH_MODE = "NONE";
  }
  else if(keyCode == 49 && inMenu){ // 1
    SEARCH_MODE = 'bfs';
  }
  else if(keyCode == 50 && inMenu){ // 2
    SEARCH_MODE = 'dfs';
  }
  else if(keyCode == 51 && inMenu){ // 3
    SEARCH_MODE = 'ucs';
  }
  else if(keyCode == 52 && inMenu){ // 4
    SEARCH_MODE = 'greedy';
  }
  else if(keyCode == 53 && inMenu){ // 5
    SEARCH_MODE = 'a_star';
  }
}

function draw() {
  if(inMenu){
    let logo = "BEST PATH FINDER";
    let tutorial = "Press the following digits to start:";
    let offset = 50;
    let search1 = "1 - BFS";
    let search2 = "2 - DFS";
    let search3 = "3 - UCS";
    let search4 = "4 - Greedy";
    let search5 = "5 - A*";
    let escape = "In search, press ESCAPE to go back to menu!"

    background(0);
    textSize(40);
    fill(color('white'));
    textAlign(CENTER);
    text(logo, screenWidth/2, screenHeight/8);

    textSize(20);
    text(tutorial, screenWidth/2, screenHeight/6);
    text(search1, screenWidth/2, screenHeight/6 + 2 * offset);
    text(search2, screenWidth/2, screenHeight/6 + 3 * offset);
    text(search3, screenWidth/2, screenHeight/6 + 4 * offset);
    text(search4, screenWidth/2, screenHeight/6 + 5 * offset);
    text(search5, screenWidth/2, screenHeight/6 + 6 * offset);
    text(escape, screenWidth/2, screenHeight/1.1);

    if(SEARCH_MODE != "NONE"){
      mapa = new Map(screenWidth, screenHeight, gridWidht, gridHeight);
      mapa.search_mode = SEARCH_MODE;
      mapa.setup_search();
      inMenu = false;
    }
  }
  else{
    //If showed path, then walk
    if(hasPrintedPath){
      hasFinished = true;
      
      mapa.walk(count);
      count++;
      
      // Found target
      if(mapa.agent_pos_x == mapa.target_pos_x && mapa.agent_pos_y == mapa.target_pos_y){
        hasFound = false;
        hasPrintedPath = false;
        count = 0;
        targetCnt++;
        mapa.setup_target();
        mapa.setup_search();
      }
    }
    
    //If found path, then show it
    if(hasFound && !hasPrintedPath){
      mapa.print_path(count);
      count = count + 1;
      
      if(count == mapa.path.length){
        hasPrintedPath = true;
        count = 0;
      }
    }
    
    // Find the path
    if(!hasFound){
      if(mapa.visited[mapa.target_pos_y][mapa.target_pos_x]){
        hasFound = true;
        mapa.find_path();
      }
      mapa.run_search();
    }
    
    mapa.show();
    let targetCounter = "Targets: " + targetCnt.toString();
    textSize(30);
    fill(color('red'));
    textAlign(CENTER);
    text(targetCounter, 90, 40);
    text(SEARCH_MODE.toUpperCase(), screenWidth/2, screenHeight/10);
  }
}
