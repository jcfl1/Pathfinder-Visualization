class Node{
  constructor(i, j, father){
    this.i = i;
    this.j = j;
    this.father = father;
  }
  
  copy(){
    return new Node(this.i, this.j, this.father)
  }
}