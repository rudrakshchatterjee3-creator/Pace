import { useEffect, useRef } from "react";

// Slow, breathing gradient in the Pace palette (paper / sage / peach).
// Purely decorative — disabled under prefers-reduced-motion.
const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float pulse = sin(u_time * 0.3) * 0.5 + 0.5;

    vec3 color1 = vec3(0.968, 0.961, 0.941); // paper #F7F5F0
    vec3 color2 = vec3(0.549, 0.647, 0.647); // accent-calm #8CA5A5
    vec3 color3 = vec3(0.863, 0.682, 0.588); // accent-warm #DCAE96

    float f = 0.0;
    f += sin(uv.x * 3.0 + u_time * 0.2) * 0.5;
    f += sin(uv.y * 2.0 - u_time * 0.3) * 0.5;

    vec3 color = mix(color1, color2, clamp(f + pulse * 0.5, 0.0, 1.0));
    color = mix(color, color3, clamp(sin(u_time * 0.1) * 0.2 + uv.y * 0.5, 0.0, 1.0));

    gl_FragColor = vec4(color, 1.0);
}`;

export default function ShaderBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function compile(type: number, src: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");

    function resize() {
      const { clientWidth, clientHeight } = canvas!;
      if (canvas!.width !== clientWidth || canvas!.height !== clientHeight) {
        canvas!.width = clientWidth;
        canvas!.height = clientHeight;
      }
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frame = 0;
    function render(t: number) {
      resize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, t * 0.001);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
