#define PI 3.1415926535897932384626
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return ( 21.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) ) ) + 0.5;
}
float fnoise(vec3 xyz, int n) {
    float sum = 0.0;
    float smax = 0.0;
    float scale;
    for (int i = 0; i < n; i++) {
        scale=pow(1.5,float(i));
        sum+=snoise(xyz*pow(1.95,float(i))+float(i))/scale;
        smax+=1.0/scale;
    }
    return sum/smax;
}
float lerp(float x, float y, float t) {
    return x+(t*(y-x));
}

vec2 rotate(vec2 point,float theta) {
    return (vec2(cos(theta),sin(theta))*point.x)+(vec2(-sin(theta),cos(theta))*point.y);
}

vec2 spiral(float time) {
    return vec2(cos(sqrt(time)),sin(sqrt(time)))*time;
}

int detailIter = 32;
int detailFrac = 12;

vec4 mImg(vec2 fragCoord)
{
    
    vec3 col = vec3(0.0);
    float cmax = 0.0;
    for (int i = 1; i < detailIter; i++) {
        vec2 uv = (1.5*(fragCoord-(iResolution.xy/2.0))/iResolution.x);
        float ps = float(i);
        uv=vec2(uv.x-mod(uv.x,ps/iResolution.x),uv.y-mod(uv.y,ps/iResolution.x));

        uv=rotate(uv,((iMouse.x/iResolution.x)-0.5)*PI);
        float edge = (abs(uv.x-uv.y)+abs(uv.y+uv.x))/2.0;
        float time = 1.5;//+((iMouse.x/iResolution.x)*2.0-1.0);
        float ts = 0.5;
        float dt = 1.0/128.0;
        float dc = 1.0/256.0;

        float cr = fnoise(vec3(rotate(uv,-dt)+(vec2(0.0,0.75)*dc),(ts*time)-dt),detailFrac)-edge;
        float cg = fnoise(vec3(uv+(vec2(sqrt(0.75),-0.75)*dc),(ts*time)),detailFrac)-edge;
        float cb = fnoise(vec3(rotate(uv,dt)+(vec2(-sqrt(0.75),-0.75)*dc),(ts*time)+dt),detailFrac)-edge;

        float ym = iMouse.y/iResolution.y;
        col += vec3(cr<ym,cg<ym,cb<ym)*ps;
        cmax += ps;
    }
    cmax += cmax*float(distance(fragCoord.xy,iMouse.xy)<20.0);
    col/=cmax;
    // Output to screen
    return vec4(col,1.0);
}

void mainImage(out vec4 fragColor, in vec2 c) {
    /*vec4 p0 = mImg(c);
    if ((p0.r+p0.g+p0.b)>=750.0) {
        fragColor=p0;
    } else {
        vec4 p1 = mImg(c+vec2( 1.0, 0.0));
        vec4 p2 = mImg(c+vec2( 0.0, 1.0));
        vec4 p3 = mImg(c+vec2(-1.0, 0.0));
        vec4 p4 = mImg(c+vec2( 0.0,-1.0));
        vec4 po = (p1+p2+p3+p4)/4.0;
        fragColor=vec4(((p0.r<po.r)?0.0:p0.r),((p0.g<po.g)?0.0:p0.g),((p0.b<po.b)?0.0:p0.b),1.0);
    }*/
    fragColor=mImg(c);
}
