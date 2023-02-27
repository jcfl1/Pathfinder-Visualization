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
      
       // Create Matrices
       this.initialize_visited();
       this.initialize_node_matrix();
       this.initialize_path_matrix();
      
       this.checkPath(); // se não houver caminho ate o alvo, o mapa será refeito
       this.search_mode = 'bfs'
      }
  }

  setup_search(){
    // Initialize matrices
    this.initialize_visited();
    this.initialize_path_matrix();
    this.initialize_cost_matrix();
    this.initialize_node_matrix();

    // Initialize queue
    this._queue = [];

    if(this.search_mode == 'bfs'){
      this.setup_incremental_bfs();
    }

    else if(this.search_mode == 'a_star'){
      this.setup_incremental_a_star();
    }

    else if(this.search_mode == 'ucs'){
      this.setup_incremental_ucs();
    }

    else if(this.search_mode == 'greedy'){
      this.setup_incremental_greedy();
    }
  }

  run_search(){
    if(this.search_mode == 'bfs'){
      this.incremental_bfs();
    }

    else if(this.search_mode == 'a_star'){
      this.incremental_a_star();
    }

    else if(this.search_mode == 'ucs'){
      this.incremental_ucs();
    }

    else if(this.search_mode == 'greedy'){
      this.greedy();
    }
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

  heuristic(node){
    return abs(node.i - this.target_pos_y) + abs(node.j - this.target_pos_x);
  }

  setup_incremental_ucs() {
    let startNode = new Node(this.agent_pos_y, this.agent_pos_x, null);
    this._queue = [];

    // Add to queue, visit and add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this.visited[startNode.i][startNode.j] = true;
    this._queue.push([0,startNode]);
  }
  
  incremental_ucs() {
    if (this._queue.length > 0) {
      this._queue.sort();
      let p = this._queue.shift();
      
      let currentNode = p[1]

      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);

        if (!this.visited[neighbor.i][neighbor.j]) {
          // Save its father
          neighbor.father = currentNode;

          // Add to queue, visit and add to node matrix
          this.visited[neighbor.i][neighbor.j] = true;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
          this._queue.push([
            (this.matrix[neighbor.i][neighbor.j]+1)*-1,
            neighbor
          ]);
        }
      }
    }
  }

  setup_incremental_a_star(){
    let startNode = this.graph.graph_node_matrix[this.agent_pos_y][this.agent_pos_x];
    // In this case this._queue will a be list of tuples [Node, PRIORITY_COST]
    this.initialize_cost_matrix();
    this._cost[startNode.i][startNode.j] = 0;
    
    // Add to queue, add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this._queue.push([startNode, 0]);
  }

  incremental_a_star(){
    if(this._queue.length > 0){
      // Find highest priority (the one with lowest PRIORITY_COST)
      let winner = 0;
      for(let i=0; i < this._queue.length; i++){
        if(this._queue[i][1] < this._queue[winner][1]){
          winner = i;
        }
      }

      // Get current node (higest priority)
      let currentNode = this._queue[winner][0];
      // Removing this element from queue
      let half_before_currentNode = this._queue.slice(0, winner);
      let half_after_currentNode = this._queue.slice(winner+1);
      this._queue = half_before_currentNode.concat(half_after_currentNode);

      // Get neighbors and check if new cost is better than old costs. If so, add it to queue
      let new_cost, neighbor_and_edge_cost, neighbor, edge_cost;
      for(let i=0; i < currentNode.neighbors.length; i++){
        // Get neighbor
        neighbor_and_edge_cost = this.graph.graph_node_matrix[currentNode.i][currentNode.j].neighbors[i];
        neighbor = neighbor_and_edge_cost[0];
        neighbor = this.graph.graph_node_matrix[neighbor.i][neighbor.j]
        edge_cost = neighbor_and_edge_cost[1];

        // Check if new cost is better than old cost
        new_cost = this._cost[currentNode.i][currentNode.j] + edge_cost;
        if(this._cost[neighbor.i][neighbor.j] == null || new_cost < this._cost[neighbor.i][neighbor.j]){
          // Add it to queue
          let priority = new_cost + this.heuristic(neighbor);
          this._queue.push([neighbor, priority]);
          
          // Save its new cost
          this._cost[neighbor.i][neighbor.j] = new_cost;
          
          // Save its father
          neighbor.father = currentNode;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
        }
      }

      // Visit current node
      this.visited[currentNode.i][currentNode.j] = true;

    }
  }

  setup_incremental_greedy(){
    let startNode = this.graph.graph_node_matrix[this.agent_pos_y][this.agent_pos_x];
    // In this case this._queue will a be list of tuples [Node, PRIORITY_COST]
    this.initialize_cost_matrix();
    this._cost[startNode.i][startNode.j] = 0;
    
    // Add to queue, add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this._queue.push([startNode, 0]);
  }

  greedy() {
    if(this._queue.length > 0){
      // Find highest priority (the one with lowest PRIORITY_COST)
      let winner = 0;
      for(let i=0; i < this._queue.length; i++){
        if(this._queue[i][1] < this._queue[winner][1]){
          winner = i;
        }
      }
      
      let currentNode = this._queue[winner][0];
      this.visited[currentNode.i][currentNode.j] = true;
      // Removing this element from queue
      let half_before_currentNode = this._queue.slice(0, winner);
      let half_after_currentNode = this._queue.slice(winner+1);
      this._queue = half_before_currentNode.concat(half_after_currentNode);

      if(currentNode.i == this.target_pos_y && currentNode.j == this.target_pos_x){
        return
      }

      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);
        let currentCost = this.heuristic(neighbor)
        if(!this.visited[neighbor.i][neighbor.j]){
          this._queue.push([neighbor, currentCost]);
        }
        
        neighbor.father = currentNode;
        this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
      }
    }
  }

  setup_incremental_bfs(){
    let startNode = new Node(this.agent_pos_y, this.agent_pos_x, null);
    
    // Add to queue, visit and add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this.visited[startNode.i][startNode.j] = true;
    this._queue.push(startNode);
  }
  
  
  incremental_bfs(){
    if(this._queue.length > 0){
      let currentNode = this._queue.shift();
      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);

        if (!this.visited[neighbor.i][neighbor.j]) {
          // Save its father
          neighbor.father = currentNode;
          
          // Add to queue, visit and add to node matrix
          this._queue.push(neighbor);
          this.visited[neighbor.i][neighbor.j] = true;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
        }
      }
    }
  };
  
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

  initialize_test_matrix() {
    this.matrix = [];

    for (let i = 0; i < this.rows; i++) {
      this.matrix[i] = [];
      for (let j = 0; j < this.cols; j++) {
        let curr;
        if(j > this.cols/4 && j < 3*this.cols/4 && i > this.rows/4 && i < 3*this.rows/4){
          curr = 2;
        }
        else{
          curr = 0;
        }
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
  
  initialize_path_matrix(){
    this.path_matrix = [];
      
    for(let i=0; i<this.rows; i++){
      this.path_matrix[i] = [];
      for(let j=0; j<this.cols; j++){
        let curr = false;
        this.path_matrix[i][j] = curr;
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

  initialize_cost_matrix(){
    this._cost = [];
    for(let i=0; i<this.rows; i++){
      this._cost[i] = [];
      for(let j=0; j<this.cols; j++){
        let curr = null;
        this._cost[i][j] = curr;
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
  
  print_path(count){
    let currentNode = this.path[count];
    this.path_matrix[currentNode.i][currentNode.j] = true; 
    this.sleep(100);
  }
  
  walk(count){
    let currentNode = this.path[count];
    this.path_matrix[currentNode.i][currentNode.j] = false; 
    
    this.agent_pos_x = this.path[count].j;
    this.agent_pos_y = this.path[count].i;
    let weight = this.matrix[this.path[count].i][this.path[count].j];
    
    this.sleep(50 + 400*weight);
  }
  
  show(){
    // Print blocks
    // 0: earth, 1: mud, 2: water, 3: wall
    for(var i=0; i <this.rows; i++){
      for(var j=0; j < this.cols; j++){
        stroke(0, 0, 0, 80)
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

        if(this.visited[i][j]){
          // If visited, then color gets darker
          fill(0, 0, 0, 50)
          stroke(255, 0, 0)
          rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
        }
        
        if(this.path_matrix[i][j]){
          // If exists a path, print it
          fill(255, 255, 255, 180);
          stroke(0, 0, 0, 80);
          rectMode(CENTER)
          rect(j*this.block_width + this.block_width/2, i*this.block_height + this.block_height/2, this.block_width/2, this.block_height/2);
          rectMode(CORNER)
        }
      }
    }
    
    // Print Frontier
    for(let qindex=0; qindex < this._queue.length; qindex++){
      let currentNode = this._queue[qindex];

      if(this.search_mode == 'a_star' || this.search_mode == "greedy"){
        currentNode = currentNode[0];
      }

      if(this.search_mode == 'ucs'){
        currentNode = currentNode[1];
      }

      let i = currentNode.i;
      let j = currentNode.j;
      
      fill(0, 255, 0, 50);
      stroke(0, 255, 0);
      rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
    }
    
    
    
    stroke(0)
    
    // Print Agent
    fill(249, 215, 28); // kind of blue color
    circle(this.agent_pos_x*this.block_width+this.block_width/2, this.agent_pos_y*this.block_height+this.block_height/2, this.block_height/1.5)
    
    // Print target
    fill(160, 0, 0);
    circle(this.target_pos_x*this.block_width+this.block_width/2, this.target_pos_y*this.block_height+this.block_height/2, this.block_height/1.5)
  } 
  
}
