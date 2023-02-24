// [ToDo] Setar bloco em baixo do agente para ser areia

class Map{
  constructor(width, height, rows, cols){
    // Creating canvas
    this.width = width;
    this.height = height;
    
    // Setting block size
    this.rows = rows;
    this.cols = cols;
    this.block_width = width/cols;
    this.block_height = height/rows;
    this.initialize_matrix();
    
    this.pathExists = false;
    
     while(this.pathExists == false){
       // Create Visualization Matrix
       this.initialize_matrix();
       
       // Create Agent
       this.agent_pos_x = floor(random(cols));
       this.agent_pos_y = floor(random(rows));
       this.matrix[this.agent_pos_y][this.agent_pos_x] = 0;
      
       // Create target
       const MIN_DIST = 5;
       do{
        this.target_pos_x = floor(random(cols));
        } while(abs(this.target_pos_x - this.agent_pos_x) < MIN_DIST);
       do{
        this.target_pos_y = floor(random(rows));
        } while(abs(this.target_pos_y - this.agent_pos_y) < MIN_DIST);
       this.matrix[this.target_pos_y][this.target_pos_x] = 0;
      
       // Create Graph
       this.graph = new Graph(this.matrix);
      
       // Create Visited Matrix
       this.initialize_visited();
      
      
       this.checkPath(); // se não houver caminho ate o alvo, o mapa será refeito
       this.show()
     }
    
  }
  
   checkPath(){
     this.bfs();
     if(this.visited[this.target_pos_y][this.target_pos_x]){
       this.pathExists = true;
     }
   }
  
  bfs() {
    let startNode = [];
    startNode.push(this.agent_pos_y)
    startNode.push(this.agent_pos_x)
    let queue = [startNode];
    
    this.visited[startNode[0]][startNode[1]] = true;
    while (queue.length > 0) {
      let currentNode = queue.shift();
      let neighbors = this.graph.graph_matrix[currentNode[0]][currentNode[1]];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!this.visited[neighbor[0]][neighbor[1]]) {
          this.visited[neighbor[0]][neighbor[1]] = true; // colocando o nó visitado para true
          queue.push(neighbor);
        }
      }
    }
  }
  
  initialize_matrix(){
    this.matrix = [];
      
    for(let i=0; i<this.rows; i++){
      this.matrix[i] = [];
      for(let j=0; j<this.cols; j++){
        let curr = floor(random(0,4));
        this.matrix[i][j] = curr;
      }
    }
  }
  
  initialize_visited(){
    this.visited = [];
      
    for(let i=0; i<this.rows; i++){
      this.visited[i] = [];
      for(let j=0; j<this.cols; j++){
        let curr = false;
        this.visited[i][j] = curr;
      }
    }
  }
  
  show(){
    
    // Print blocks
    // 0: earth, 1: mud, 2: water
    for(var i=0; i <this.rows; i++){
      for(var j=0; j < this.cols; j++){
        if(this.matrix[i][j] == 0){
          fill(255 , 248, 220);
        }
        else if (this.matrix[i][j] == 1){
          fill(208,187,148);
        }
        else if (this.matrix[i][j] == 2){
          fill(150, 150, 220);
        }
        else if (this.matrix[i][j] == 3){
          fill(110);
        }
        rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
      }
    }
    
    // Print Agent
    fill(249, 215, 28); // kind of blue color
    rect(this.agent_pos_x*this.block_width, this.agent_pos_y*this.block_height, this.block_width, this.block_height);
    
    // Print target
    fill(160, 0, 0);
    rect(this.target_pos_x*this.block_width, this.target_pos_y*this.block_height, this.block_width, this.block_height);
  }  
  
}
