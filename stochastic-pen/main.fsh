float lerp(float a, float b, float t) {
    return a+(t*(b-a));
}

float lineDist(vec2 v, vec2 w, vec2 p) {
  // Return minimum distance between line segment vw and point p
  float l2 = dot(w-v,w-v);  // i.e. |w-v|^2 -  avoid a sqrt
  if (l2 == 0.0) return distance(p, v);   // v == w case
  // Consider the line extending the segment, parameterized as v + t (w - v).
  // We find projection of point p onto the line. 
  // It falls where t = [(p-v) . (w-v)] / |w-v|^2
  // We clamp t from [0,1] to handle points outside the segment vw.
  float t = max(0.0, min(1.0, dot(p - v, w - v) / l2));
  vec2 projection = v + t * (w - v);  // Projection falls on the segment
  return distance(p, projection);
}

#define PI 3.1415926535897932384626
#define TAU 2.0*PI
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    float col = 0.0;
    vec2 xy = vec2(0.0,0.0);
    vec4 h = vec4(0.1,0.0,0.0,0.0);
    float d=1.0;
    vec2 z;
    for (int i = 0; i < 32768; i++) {
        for (;(i<32768)&&(d>0.0078125);i++) {
            z = xy+vec2(cos(h.w),sin(h.w))*0.01;
            d = lineDist(xy,z,uv);
            xy=mod(z,1.0);//vec2(cos(h.w),sin(h.w));
            h.yzw+=h.xyz;
            h.w%=TAU;
        }
        if (d<=0.0078125) {col+=0.0078125;}
    }
    fragColor = vec4(col,col,col,1.0);
}
