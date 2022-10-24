const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

out vec4 v_color;

// all shaders have a main function
void main() {
  gl_Position = u_matrix * a_position;

  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

const initShadersProgram = (gl) => {
  // Compile Vertex shader
  const vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vertexShaderSource);
  gl.compileShader(vsh);

  // Check if compile was successful
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw new Error('Error in vertex shader:  ' + gl.getShaderInfoLog(vsh));
  }

  // Compile Fragment Shader
  const fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fragmentShaderSource);
  gl.compileShader(fsh);

  // Check if compile was successful
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw new Error('Error in fragment shader:  ' + gl.getShaderInfoLog(fsh));
  }

  // Create a program with both Vertex and Fragment shaders
  const prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);

  // Check if program was created successfully
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Link error in program:  ' + gl.getProgramInfoLog(prog));
  }

  return prog;
};

export default initShadersProgram;
