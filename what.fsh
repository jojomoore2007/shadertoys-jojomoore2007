vec4 remap(vec4 x) {
    return (x+vec4(1,1,1,3))/4.0;
}
vec4 quaternionMult(vec4 a, vec4 b) {
    return vec4(
        ((a.w*b.x)+(a.x*b.w)+(a.y*b.z)-(a.z*b.y)),
        ((a.w*b.y)-(a.x*b.z)+(a.y*b.w)+(a.z*b.x)),
        ((a.w*b.z)+(a.x*b.y)-(a.y*b.x)+(a.z*b.w)),
        ((a.w*b.w)-(a.x*b.x)-(a.y*b.y)-(a.z*b.z))
    );
}

vec4 fractal(sampler2D tex, vec2 p0) {
    vec2 p = p0.xy-0.5;
    vec4 o = vec4(0.0,0.0,0.0,0.0);
    for (int i = 1; i < 16; i++) {
        o=o+(texture(tex,p+0.5)/pow(1.25,float(i)));
        p=2.1*p+p0;
    }
    return vec4(o.xyz/o.w,1.0);
}

vec4 fractal2(sampler2D tex, vec2 p0) {
    vec2 p = p0.xy-0.5;
    vec4 o = vec4(0.0,0.0,0.0,0.0);
    for (int i = 1; i < 16; i++) {
        o=o+(fractal(tex,p+0.5)/pow(1.25,float(i)));
        p=2.1*p+p0;
    }
    return vec4(o.xyz/o.w,1.0);
}

const float refX=95.047,refY=100.000,refZ=108.883;
const float refUVD=(refX+(15.0*refY)+(3.0*refZ));
const float refU=4.0*refX/refUVD;
const float refV=9.0*refY/refUVD;
vec3 rgb2luv(vec3 sRGB) {
  float varR,varG,varB,varX,varY,varUVD,varU,varV,L,u,v;
  varR=sRGB.r/255.0;
  varG=sRGB.g/255.0;
  varB=sRGB.b/255.0;
  
  if (varR>0.04045) {varR=pow(((varR+0.055)/1.055),2.4);} else {varR/=12.92;}
  if (varG>0.04045) {varG=pow(((varG+0.055)/1.055),2.4);} else {varG/=12.92;}
  if (varB>0.04045) {varB=pow(((varB+0.055)/1.055),2.4);} else {varB/=12.92;}
  
  varX=(varR*0.4124)+(varG*0.3576)+(varB*0.1805);
  varY=(varR*0.2126)+(varG*0.7152)+(varB*0.0722);
  
  varUVD=(3.6593*varR)+(11.4432*varG)+(4.115*varB);
  
  if (varY>0.008856) {
      varY=pow(varY,(1.0/3.0));
  } else {
      varY=(7.787*varY)+(16.0/116.0);
  }
  varU=(400.0*varX)/varUVD;
  varV=(900.0*varY)/varUVD;
  
  L = (116.0*varY)-16.0;
  u = 13.0*L*(varU-refU);
  v = 13.0*L*(varV-refV);
  return vec3(L,u,v);
}

vec4 what(sampler2D tex, vec2 p0) {
    vec3 p = (p0.xxy+p0.xyy)/2.0;
    for (int i = 0; i < 2; i++) {
        p=(p.rgb+p.brg+p.gbr+texture(tex,p.xy).rgb+texture(tex,p.xz).gbr+texture(tex,p.yz).brg)/6.0;
    }
    return vec4(p,1.0);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    // Output to screen
    vec4 col = vec4(0.0);
    
    fragColor = col.rgba/col.a;
}
