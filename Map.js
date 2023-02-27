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

    this.HOLE_PROB = 0.55;
    
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
    
      // Create Graph
      this.graph = new Graph(this.matrix);
    
      // Create Matrices
      this.initialize_visited();
      this.initialize_node_matrix();
      this.initialize_path_matrix();
    
      this.checkPath(); // se não houver caminho ate o alvo, o mapa será refeito
    }
  }
  
  // Create new target
  setup_target(){
    this.pathExists = false;
    while(this.pathExists == false){
      const MIN_DIST = 5;
      do{
        this.target_pos_x = floor(random(this.cols));
      } while(abs(this.target_pos_x - this.agent_pos_x) < MIN_DIST);
      do{
        this.target_pos_y = floor(random(this.rows));
      } while(abs(this.target_pos_y - this.agent_pos_y) < MIN_DIST);

      this.initialize_visited();
      this.initialize_node_matrix();
      this.initialize_path_matrix();
      this.checkPath(); // se não houver caminho ate o alvo, o mapa será refeito
    }
    this.graph = new Graph(this.matrix);
  }

  setup_search(){
    // Initialize matrices
    this.initialize_visited();
    this.initialize_path_matrix();
    this.initialize_cost_matrix();
    this.initialize_node_matrix();

    // Initialize queue
    this._queue = [];
    
    //Initialize stack
    this._stack = [];

    if(this.search_mode == 'bfs'){
      this.setup_incremental_bfs();
    }

    else if(this.search_mode == 'a_star'){
      this.setup_incremental_ucs_and_a_star();
    }

    else if(this.search_mode == 'ucs'){
      this.setup_incremental_ucs_and_a_star();
    }

    else if(this.search_mode == 'greedy'){
      this.setup_incremental_greedy();
    }
    
    else if(this.search_mode == 'dfs'){
      this.setup_incremental_dfs();
    }
  }

  run_search(){
    if(this.search_mode == 'bfs'){
      this.incremental_bfs();
    }

    else if(this.search_mode == 'a_star'){
      this.incremental_ucs_and_a_star(true);
    }

    else if(this.search_mode == 'ucs'){
      this.incremental_ucs_and_a_star(false);
    }

    else if(this.search_mode == 'greedy'){
      this.greedy();
    }
    
    else if(this.search_mode == 'dfs'){
      this.incremental_dfs();
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

  setup_incremental_ucs_and_a_star(){
    let startNode = this.graph.graph_node_matrix[this.agent_pos_y][this.agent_pos_x];
    // In this case this._queue will a be list of tuples [Node, PRIORITY_COST]
    this.initialize_cost_matrix();
    this._cost[startNode.i][startNode.j] = 0;
    
    // Add to queue, add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this._queue.push([startNode, 0]);
  }

  incremental_ucs_and_a_star(is_a_star){
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
          let priority = new_cost;
          if(is_a_star) priority += this.heuristic(neighbor);
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
      // this.visited[currentNode.i][currentNode.j] = true;
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
          this.visited[neighbor.i][neighbor.j] = true;
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
  }
    
  setup_incremental_dfs(){
    let startNode = new Node(this.agent_pos_y, this.agent_pos_x, null);
    
    // Add to stack, visit and add to node matrix
    this.node_matrix[startNode.i][startNode.j] = startNode.copy();
    this.visited[startNode.i][startNode.j] = true;
    this._stack.push(startNode);
  }
  
  incremental_dfs(){
    if(this._stack.length > 0){
      let currentNode = this._stack.pop();
      let neighbors = this.graph.graph_matrix[currentNode.i][currentNode.j];
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = new Node(neighbors[i][0], neighbors[i][1], undefined);

        if (!this.visited[neighbor.i][neighbor.j]) {
          // Save its father
          neighbor.father = currentNode;
          
          // Add to stack, visit and add to node matrix
          this._stack.push(neighbor);
          this.visited[neighbor.i][neighbor.j] = true;
          this.node_matrix[neighbor.i][neighbor.j] = neighbor.copy();
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
    noiseSeed(random(10000));

    for(let i=0; i<this.rows; i++){
      this.matrix[i] = [];
      for(let j=0; j<this.cols; j++){
        let freq = 2;
        let ni = i/this.cols
        let nj = j/this.rows
        let curr = map(noise(freq*ni, freq*nj), 0, 1, 0, 3);
        this.matrix[i][j] = floor(curr);
      }
    }
    // Adicionando obstáculos
    this.addInnerWalls(true, 1, this.cols - 2, 1, this.rows - 2);
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
  
  addInnerWalls(h, minX, maxX, minY, maxY) {
    if (h) {

        if (maxX - minX < 4) {
            return;
        }

        let y = floor(random(minY, maxY));
        this.addHWall(minX, maxX, y);

        this.addInnerWalls(!h, minX, maxX, minY, y-1);
        this.addInnerWalls(!h, minX, maxX, y + 1, maxY);
    } else {
        if (maxY - minY < 4) {
            return;
        }

        let x = floor(random(minX, maxX));
        this.addVWall(minY, maxY, x);

        this.addInnerWalls(!h, minX, x-1, minY, maxY);
        this.addInnerWalls(!h, x + 1, maxX, minY, maxY);
    }
  }

  addHWall(minX, maxX, y) {
    var hole = random();

    for (var i = minX; i <= maxX; i++) {
        if (hole >= this.HOLE_PROB) this.matrix[y][i] = 3;
    }
  }

  addVWall(minY, maxY, x) {
    var hole = random();

    for (var i = minY; i <= maxY; i++) {
        if (hole >= this.HOLE_PROB) this.matrix[i][x] = 3;
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
    
    //this.sleep(50 + 400*weight);
    this.sleep(100*weight);
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
    
    if(this.search_mode == 'dfs'){
      // Print Frontier
      for(let qindex=0; qindex < this._stack.length; qindex++){
        let currentNode = this._stack[qindex];

        if (currentNode) { // add a check to ensure currentNode is not undefined
          let i = currentNode.i;
          let j = currentNode.j;
    
          fill(0, 255, 0, 50);
          stroke(0, 255, 0);
          rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
        }
      } 
    }
    
    else{
      // Print Frontier
      for(let qindex=0; qindex < this._queue.length; qindex++){
        let currentNode = this._queue[qindex];

        if(this.search_mode == 'ucs' || this.search_mode == 'a_star'|| this.search_mode == "greedy"){
          currentNode = currentNode[0];
        }
      
        let i = currentNode.i;
        let j = currentNode.j;
      
        fill(0, 255, 0, 50);
        stroke(0, 255, 0);
        rect(j*this.block_width, i*this.block_height, this.block_width, this.block_height);
      } 
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
