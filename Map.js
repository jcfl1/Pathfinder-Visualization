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
       
       // Create Node Matrix
       this.initialize_node_matrix();
      
       this.checkPath(); // se não houver caminho ate o alvo, o mapa será refeito
     }
    
    this.find_path();
    this.show();
  }
  
   checkPath(){
     this.bfs();
     if(this.visited[this.target_pos_y][this.target_pos_x]){
       this.pathExists = true;
     }
   }
  
  bfs() {
    let startNode = new Node(this.agent_pos_y, this.agent_pos_x, null);
    let queue = [];
    
    // Add to queue, visit and add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this.visited[startNode.i][startNode.j] = true;
    queue.push(startNode);
    
    while (queue.length > 0) {
      let currentNode = queue.shift();
      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);

        if (!this.visited[neighbor.i][neighbor.j]) {
          // Save its father
          neighbor.father = currentNode;
          
          // Add to queue, visit and add to node matrix
          this.visited[neighbor.i][neighbor.j] = true;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
          queue.push(neighbor);
        }
      }
    }
  }
  
  setup_incremental_bfs(){
    let startNode = new Node(this.agent_pos_y, this.agent_pos_x, null);
    this._bfs_queue = [];
    
    // Add to queue, visit and add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this.visited[startNode.i][startNode.j] = true;
    this._bfs_queue.push(startNode);
  }
  
  incremental_bfs(){
    if(this._bfs_queue.length > 0){
      let currentNode = this._bfs_queue.shift();
      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);

        if (!this.visited[neighbor.i][neighbor.j]) {
          // Save its father
          neighbor.father = currentNode;
          
          // Add to queue, visit and add to node matrix
          this.visited[neighbor.i][neighbor.j] = true;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
          this._bfs_queue.push(neighbor);
        }
      }
    }
  }
  
  find_path(){
    // Should be called ONLY AFTER one search algorithmn has been finished
    
    let path = [];
    path.push(this.node_matrix[this.target_pos_y][this.target_pos_x]);
  
    
    let currentNode = path[0];
    
    while(currentNode.father != null){
      let currentFather = currentNode.father;
      path.push(currentFather);
      currentNode = currentFather;
    }
    
    this.path = path.reverse();
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
  
  initialize_node_matrix(){
    this.node_matrix = [];
    for(let i=0; i<this.rows; i++){
      this.node_matrix[i] = [];
      for(let j=0; j<this.cols; j++){
        let curr = null;
        this.node_matrix[i][j] = curr;
      }
    }
  }
  
  // Sleep function
  sleep(milliseconds){
      const date = Date.now()
      let currentDate = null;
      do{
        currentDate = Date.now();
      } while(currentDate - date < milliseconds);
  }
  
  walk(count){
    this.agent_pos_x = this.path[count].j;
    this.agent_pos_y = this.path[count].i;
    let weight = this.matrix[this.path[count].i][this.path[count].j];
    
    this.sleep(500*weight);
  }
  
  show(){
    // Print blocks
    // 0: earth, 1: mud, 2: water
    for(var i=0; i <this.rows; i++){
      for(var j=0; j < this.cols; j++){
        if(this.matrix[i][j] == 0){
          fill(255 , 248, 220);
          stroke(0)
        }
        else if (this.matrix[i][j] == 1){
          fill(208,187,148);
          stroke(0)
        }
        else if (this.matrix[i][j] == 2){
          fill(150, 150, 220);
          stroke(0)
        }
        else if (this.matrix[i][j] == 3){
          fill(110);
          stroke(0)
        }
        rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
        //vou ver se foi visitado
        if(this.visited[i][j]){
          // a cor fica mais clara
          fill(0, 0, 0, 50)
          stroke(255, 0, 0)
          rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
        }
      }
    }
    
    // Print Agent
    fill(249, 215, 28); // kind of blue color
    //rect(this.agent_pos_x*this.block_width, this.agent_pos_y*this.block_height, this.block_width, this.block_height);
    circle(this.agent_pos_x*this.block_width+this.block_width/2, this.agent_pos_y*this.block_height+this.block_height/2, this.block_height/1.5)
    
    // Print target
    fill(160, 0, 0);
    //rect(this.target_pos_x*this.block_width, this.target_pos_y*this.block_height, this.block_width, this.block_height);
    circle(this.target_pos_x*this.block_width+this.block_width/2, this.target_pos_y*this.block_height+this.block_height/2, this.block_height/1.5)
  } 
  
}
