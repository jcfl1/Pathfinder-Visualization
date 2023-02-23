class Map{
  constructor(width, height, rows, cols){
    // Creating canvas
    this.width = width;
    this.height = height;
    createCanvas(width, height);
    background(50);
    
    // Setting block size
    this.rows = rows;
    this.cols = cols;
    this.block_width = width/cols;
    this.block_height = height/rows;
    
    // Create Visualization Matrix
    this.initialize_matrix();
    
    // Create Graph
    this.graph = new Graph(this.matrix);
    
    // Create Agent
    this.agent_pos_x = floor(random(cols));
    this.agent_pos_y = floor(random(rows));
    
    // Create target
    const MIN_DIST = 5;
    do{
      this.target_pos_x = floor(random(cols));
    } while(abs(this.target_pos_x - this.agent_pos_x) < MIN_DIST);
    do{
      this.target_pos_y = floor(random(rows));
    } while(abs(this.target_pos_y - this.agent_pos_y) < MIN_DIST);
    
    
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