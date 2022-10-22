import './style.css';
import initShadersProgram from './src/shaders';
import mat4 from './lib/mat4';
import { setUpUISlider } from './lib/ui';

const main = () => {
  const canvas = document.querySelector('#app');
  const ctx = canvas.getContext('webgl2');

  // Check to see if context exists
  if (!ctx) {
    throw new Error('Could not get a WebGL graphics context');
  }

  // Compile and link shaders to program
  const shaderProgram = initShadersProgram(ctx);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = ctx.getAttribLocation(
    shaderProgram,
    'a_position'
  );

  // look up uniform locations
  const colorLocation = ctx.getUniformLocation(shaderProgram, 'u_color');
  const matrixLocation = ctx.getUniformLocation(shaderProgram, 'u_matrix');

  // Create a buffer
  const positionBuffer = ctx.createBuffer();

  // Create a vertex array object (attribute state)
  const vao = ctx.createVertexArray();

  // and make it the one we're currently working with
  ctx.bindVertexArray(vao);

  // Turn on the attribute
  ctx.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  setGeometry(ctx);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 3; // 3 components per iteration
  const type = ctx.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  ctx.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  let translatePos = [0, 0];

  setUpUISlider(
    'Translate X',
    [0, ctx.canvas.width],
    translatePos[0],
    (val) => {
      translatePos[0] = val;
      Render();
    }
  );
  setUpUISlider(
    'Translate Y',
    [0, ctx.canvas.height],
    translatePos[1],
    (val) => {
      translatePos[1] = val;
      Render();
    }
  );

  let rotation = [0, 0, 0];

  const degreeToRad = (deg) => {
    return (deg * Math.PI) / 180;
  };

  setUpUISlider('Rotate X', [0, 360], rotation[0], (val) => {
    rotation[0] = degreeToRad(val);
    Render();
  });
  setUpUISlider('Rotate Y', [0, 360], rotation[1], (val) => {
    rotation[1] = degreeToRad(val);
    Render();
  });
  setUpUISlider('Rotate Z', [0, 360], rotation[2], (val) => {
    rotation[2] = degreeToRad(val);
    Render();
  });

  const color = [Math.random(), Math.random(), Math.random(), 1];

  function Render() {
    // Tell WebGL how to convert from clip space to pixels
    ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Clear the canvas
    ctx.clearColor(1, 1, 1, 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    ctx.useProgram(shaderProgram);

    // Bind the attribute/buffer set we want.
    ctx.bindVertexArray(vao);

    // Set the color.
    ctx.uniform4fv(colorLocation, color);

    // Compute the matrix
    let matrix = mat4.projection(
      ctx.canvas.clientWidth,
      ctx.canvas.clientHeight,
      400
    );
    matrix = mat4.translate(matrix, translatePos[0], translatePos[1], 0);
    matrix = mat4.xRotate(matrix, rotation[0]);
    matrix = mat4.yRotate(matrix, rotation[1]);
    matrix = mat4.zRotate(matrix, rotation[2]);

    // Set the matrix.
    ctx.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    const primitiveType = ctx.TRIANGLES;
    const offsetF = 0;
    const count = 16 * 6;
    ctx.drawArrays(primitiveType, offsetF, count);
  }

  Render();
};

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column front
      0, 0, 0, 30, 0, 0, 0, 150, 0, 0, 150, 0, 30, 0, 0, 30, 150, 0,

      // top rung front
      30, 0, 0, 100, 0, 0, 30, 30, 0, 30, 30, 0, 100, 0, 0, 100, 30, 0,

      // middle rung front
      30, 60, 0, 67, 60, 0, 30, 90, 0, 30, 90, 0, 67, 60, 0, 67, 90, 0,

      // left column back
      0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

      // top rung back
      30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

      // middle rung back
      30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

      // top
      0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

      // top rung right
      100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

      // under top rung
      30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

      // between top rung and middle
      30, 30, 0, 30, 30, 30, 30, 60, 30, 30, 30, 0, 30, 60, 30, 30, 60, 0,

      // top of middle rung
      30, 60, 0, 30, 60, 30, 67, 60, 30, 30, 60, 0, 67, 60, 30, 67, 60, 0,

      // right of middle rung
      67, 60, 0, 67, 60, 30, 67, 90, 30, 67, 60, 0, 67, 90, 30, 67, 90, 0,

      // bottom of middle rung.
      30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

      // right of bottom
      30, 90, 0, 30, 90, 30, 30, 150, 30, 30, 90, 0, 30, 150, 30, 30, 150, 0,

      // bottom
      0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

      // left side
      0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
    ]),
    gl.STATIC_DRAW
  );
}

window.onload = main;
