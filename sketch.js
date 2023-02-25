var mapa;

var INCREMENTAL_BFS = true;
var hasFinished = false;
var hasArrived = false;
var count = 0;


function setup() {
  frameRate(60);
  createCanvas(800, 600);
  background(50);
  mapa = new Map(800, 600, 18, 18);
  
  if(INCREMENTAL_BFS){
    mapa.initialize_visited();
    mapa.setup_incremental_bfs();
  }
}

function draw() {
  
  if(mapa.agent_pos_x == mapa.target_pos_x && mapa.agent_pos_y == mapa.target_pos_y){
    hasArrived = true;
    noLoop();
  }
  
  if(mapa.visited[mapa.target_pos_y][mapa.target_pos_x] && !hasArrived){
    hasFinished = true;
    
    mapa.walk(count);
    count = count+1;
  }
  
  if(INCREMENTAL_BFS && !hasFinished){
    mapa.incremental_bfs();
  }
  
  mapa.show();
}
