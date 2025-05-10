class Cube {
  constructor() {
    this.type='cube';
  //  this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
  //  this.size = 5.0;
  //  this.segments = 10;
    this.matrix= new Matrix4();
    this.textureNum=-1;

  }

  

  // render this shape
  render() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    // pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // pass the matrix u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    
    drawTriangle3DUV( [0,0,0, 1,1,0,  1,0,0 ],  [0,0, 1,1,  1,0]);
    drawTriangle3DUV( [0,0,0, 0,1,0,  1,1,0 ],  [0,0, 0,1,  1,1]);

    
    // back
    drawTriangle3DUV([ 0.0, 0.0, 1.0,    0.0, 1.0, 1.0,    1.0, 1.0, 1.0], [0,0, 0,1,  1,1]);
    drawTriangle3DUV([ 0.0, 0.0, 1.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0 ], [0,0, 1,1,  1,0]);

    //top
    drawTriangle3DUV( [0,1,0,   0,1,1,    1,1,1], [0,0, 0,1,  1,1]);
    drawTriangle3DUV( [0,1,0,   1,1,1,    1,1,0], [0,0, 1,1,  1,0]);
   //drawTriangle3DUV([0, 0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 1, 1, 0]);
// left
    drawTriangle3DUV([ 0.0, 0.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 1.0], [0,0, 0,1,  1,1]);
    drawTriangle3DUV([ 0.0, 0.0, 0.0,    0.0, 1.0, 1.0,    0.0, 0.0, 1.0], [0,0, 1,1,  1,0]);

    // right
    drawTriangle3DUV([1.0, 0.0, 0.0,    1.0, 1.0, 0.0,    1.0, 1.0, 1.0], [0,0, 0,1,  1,1]);
    drawTriangle3DUV([1.0, 0.0, 0.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0], [0,0, 1,1,  1,0]);
    // drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
    // drawTriangle3DUV([0, 1, 0, 1, 1, 0, 1, 1, 1], [0, 0, 1, 1, 1, 0]);

    // bottom 
    drawTriangle3DUV([ 0.0, 0.0, 0.0,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0 ], [0,0, 1,1,  1,0]);
    drawTriangle3DUV([0.0, 0.0, 0.0,    0.0, 0.0, 1.0,    1.0, 0.0, 1.0 ], [0,0, 0,1,  1,1]);
        

  }
  renderfast() {
    //var xy = this.position;
    var rgba = this.color;
    //var size = this.size;

    //console.log("Texture Number:", this.textureNum);

    // pass the texture number
    //gl.uniform1i(u_whichTexture, this.textureNum);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // pass the matrix u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [];
    allverts=allverts.concat( [0,0,0, 1,1,0,  1,0,0 ]);
    allverts=allverts.concat( [0,0,0, 0,1,0,  1,1,0 ]);

    
    // back
    allverts=allverts.concat([ 0.0, 0.0, 1.0,    0.0, 1.0, 1.0,    1.0, 1.0, 1.0]);
    allverts=allverts.concat([ 0.0, 0.0, 1.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0 ]);

    //top
    allverts=allverts.concat( [0,1,0,   0,1,1,    1,1,1]);
    allverts=allverts.concat( [0,1,0,   1,1,1,    1,1,0]);
    
    // left
    allverts=allverts.concat([ 0.0, 0.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 1.0]);
    allverts=allverts.concat([ 0.0, 0.0, 0.0,    0.0, 1.0, 1.0,    0.0, 0.0, 1.0]);

    // right
    allverts=allverts.concat([1.0, 0.0, 0.0,    1.0, 1.0, 0.0,    1.0, 1.0, 1.0]);
    allverts=allverts.concat([1.0, 0.0, 0.0,    1.0, 1.0, 1.0,    1.0, 0.0, 1.0]);
    
    // bottom 
    allverts=allverts.concat([ 0.0, 0.0, 0.0,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0 ]);
    allverts=allverts.concat([0.0, 0.0, 0.0,    0.0, 0.0, 1.0,    1.0, 0.0, 1.0 ]);

    drawTriangle3D(allverts);
        


  }
}
