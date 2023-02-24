class Graph{
  constructor(matrix){
    // Get matrix dimension
    this.dim = matrix.length;
    
    this.graph = []
    for(let i=0; i<this.dim; i++){
      this.graph[i] = [];
      for(let j=0; j<this.dim; j++){
        
        // Initialize list 
        this.graph[i][j] = [];
        
        // Upper node
        if (this.get_up(i, j, matrix) != null) {this.graph[i][j].push(this.get_up(i, j, matrix));}
        // Right node
        if (this.get_right(i, j, matrix) != null) {this.graph[i][j].push(this.get_right(i, j, matrix));}
        // Down node
        if (this.get_down(i, j, matrix) != null) {this.graph[i][j].push(this.get_down(i, j, matrix));}
        // Left node
        if (this.get_left(i, j, matrix) != null) {this.graph[i][j].push(this.get_left(i, j, matrix));}
        
      }
    }
    
    this.marked = [];
  }
    
    
  assign_cost(num){
    if(num == 0){
      return 1;
    }
    else if(num == 1){
      return 5;
    }
    else if(num == 2){
      return 10;
    }
    else{
      return 999;
    }
  }
    
  get_up(i, j, matrix){
    if(i > 0){
      if(this.assign_cost(matrix[i-1][j]) != 999){
        let ret = [i-1, j, this.assign_cost(matrix[i-1][j])];
        return ret;
      }
    }
    return null;
  }
  get_right(i, j, matrix){
    if(j < this.dim-1){
      if(this.assign_cost(matrix[i][j+1]) != 999){
        return [i, j+1, this.assign_cost(matrix[i][j+1])];
      }
    }
    return null;
  }
  get_down(i, j, matrix){
    if(i < this.dim-1){
      if(this.assign_cost(matrix[i+1][j]) != 999){
        return [i+1, j, this.assign_cost(matrix[i+1][j])];
      }
    }
    return null;
  }
  get_left(i, j, matrix){
    if(j > 0){
      if(this.assign_cost(matrix[i][j-1]) != 999){
        return [i, j-1, this.assign_cost(matrix[i][j-1])];
      }
    }
    return null;
  }
  
  show(){
    for(let i=0; i<this.dim; i++){
      for(let j=0; j<this.dim; j++){
        console.log('From node:');
        console.log(i, j);
        let st = '';
        for(let k=0; k<this.graph[i][j].length; k++){
          let a = this.graph[i][j].length;
          console.log(a);
          //st = st + this.graph[i][j][k].toString() + ' ,';
        }
        //console.log(st);
      } 
      console.log('-------');
   }
  }
  
  
}
