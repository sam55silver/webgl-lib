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

  const colorAttributeLocation = ctx.getAttribLocation(
    shaderProgram,
    'a_color'
  );

  // look up uniform locations
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

  ctx.vertexAttribPointer(positionAttributeLocation, 3, ctx.FLOAT, false, 0, 0);

  const colorBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, colorBuffer);
  setColors(ctx);

  // Turn on the attribute
  ctx.enableVertexAttribArray(colorAttributeLocation);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  ctx.vertexAttribPointer(
    colorAttributeLocation,
    3,
    ctx.UNSIGNED_BYTE,
    true,
    0,
    0
  );

  let translatePos = [0, 0, 0];

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
  setUpUISlider('Translate Z', [-2500, 1], translatePos[2], (val) => {
    translatePos[2] = val;
    Render();
  });

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

  function Render() {
    // Tell WebGL how to convert from clip space to pixels
    ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Clear the canvas
    ctx.clearColor(1, 1, 1, 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

    ctx.enable(ctx.DEPTH_TEST);

    // tell webgl to cull faces
    ctx.enable(ctx.CULL_FACE);

    // Tell it to use our program (pair of shaders)
    ctx.useProgram(shaderProgram);

    // Bind the attribute/buffer set we want.
    ctx.bindVertexArray(vao);

    // Compute the matrix

    const fieldOfViewInRadians = (42 * Math.PI) / 180;
    const aspect = ctx.canvas.clientWidth / ctx.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    let matrix = mat4.perspective(fieldOfViewInRadians, aspect, zNear, zFar);
    matrix = mat4.translate(
      matrix,
      translatePos[0],
      translatePos[1],
      translatePos[2]
    );
    matrix = mat4.xRotate(matrix, rotation[0]);
    matrix = mat4.yRotate(matrix, rotation[1]);
    matrix = mat4.zRotate(matrix, rotation[2]);

    // Set the matrix.
    ctx.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    ctx.drawArrays(ctx.TRIANGLES, 0, 16 * 6);
  }

  Render();
};

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(ctx) {
  ctx.bufferData(
    ctx.ARRAY_BUFFER,
    new Float32Array([
      // left column front
      0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

      // top rung front
      30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

      // middle rung front
      30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

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
      30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

      // top of middle rung
      30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

      // right of middle rung
      67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

      // bottom of middle rung.
      30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

      // right of bottom
      30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

      // bottom
      0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

      // left side
      0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
    ]),
    ctx.STATIC_DRAW
  );
}

function setColors(ctx) {
  ctx.bufferData(
    ctx.ARRAY_BUFFER,
    new Uint8Array([
      // left column front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // top rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // middle rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // left column back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // middle rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top
      70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70,
      200, 210,

      // top rung right
      200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
      200, 70,

      // under top rung
      210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,
      100, 70,

      // between top rung and middle
      210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
      160, 70,

      // top of middle rung
      70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70,
      180, 210,

      // right of middle rung
      100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100,
      70, 210,

      // bottom of middle rung.
      76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76,
      210, 100,

      // right of bottom
      140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140,
      210, 80,

      // bottom
      90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90,
      130, 110,

      // left side
      160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220,
      160, 160, 220,
    ]),
    ctx.STATIC_DRAW
  );
}

window.onload = main;
