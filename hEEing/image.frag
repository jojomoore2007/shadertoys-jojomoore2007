#define HALF_PI 1.5707963267948966192313
#define PI      3.1415926535897932384626
#define TWO_PI  6.2831853071795864769252

//rotate/flip a quadrant appropriately
ivec2 rot(int n, int x, int y, int rx, int ry) {
    if (ry == 0) {
        if (rx == 1) {
            x = n-1 - x;
            y = n-1 - y;
        }

        //Swap x and y
        int t = x;
        x = y;
        y = t;
    }
    return ivec2(x,y);
}

int xy2d(int n, int x, int y) {
    int rx, ry, s, d=0;
    for (s=n/2; s>0; s/=2) {
        rx = int((x & s) > 0);
        ry = int((y & s) > 0);
        d += s * s * ((3 * rx) ^ ry);
        ivec2 xy = rot(n, x, y, rx, ry);
        x=xy.x;
        y=xy.y;
    }
    return d;
}

//convert d to (x,y)
ivec2 d2xy(int n, int d, int x, int y) {
    int rx, ry, s, t=d;
    x = y = 0;
    for (s=1; s<n; s*=2) {
        rx = 1 & (t/2);
        ry = 1 & (t ^ rx);
        ivec2 xy = rot(s, x, y, rx, ry);
        x=xy.x;
        y=xy.y;
        x += s * rx;
        y += s * ry;
        t /= 4;
    }
    return ivec2(x,y);
}
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    // Time varying pixel color
    int n = 64;
    float nf = float(n);
    float n2 = pow(nf,2.0);
    vec3 col = texture(iChannel0,uv).rgb;
    vec3 hsv = rgb2hsv(col);
    float d = float(xy2d(n,int(nf*uv.x),int(nf*uv.y)))/n2;
    // Output to screen
    fragColor = vec4(vec3(mod(hsv.x+(440.0*pow(2.0,d)*iTime*HALF_PI),TWO_PI),0.0,hsv.z),1.0);
}
