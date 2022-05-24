// file 1; buffer A
vec2 ds_set(float a)
{
    vec2 z;
    z.x = a;
    z.y = 0.0;
    return z;
}

vec2 ds_add (vec2 dsa, vec2 dsb)
{
    vec2 dsc;
    float t1, t2, e;

    t1 = dsa.x + dsb.x;
    e = t1 - dsa.x;
    t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    return dsc;
}

vec2 ds_mul(vec2 dsa, vec2 dsb)
{
    vec2 dsc;
    float c11, c21, c2, e, t1, t2;
    float a1, a2, b1, b2, cona, conb, split = 8193.;

    cona = dsa.x * split;
    conb = dsb.x * split;
    a1 = cona - (cona - dsa.x);
    b1 = conb - (conb - dsb.x);
    a2 = dsa.x - a1;
    b2 = dsb.x - b1;

    c11 = dsa.x * dsb.x;
    c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

    c2 = dsa.x * dsb.y + dsa.y * dsb.x;

    t1 = c11 + c2;
    e = t1 - c11;
    t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);

    return dsc;
}

vec2 ds_neg(vec2 x) {
    return vec2(-1.0,1.0)*x;
}

vec2 ds_sub(vec2 a,vec2 b) {
    return ds_add(a,ds_neg(b));
}

vec2 transform(vec2 c0) {
    vec2 c = (c0.xy*2.0)-1.0;
    vec2 c0x = ds_set(c0.x);
    vec2 c0y = ds_set(c0.y);
    vec2 cx = ds_set(c.x);
    vec2 cy = ds_set(c.y);
    vec2 two = vec2(2.0,0.0);
    vec2 inv = vec2(-1.0,0.0);
    vec2 zx = cx;
    vec2 zy = cy;
    vec2 zx1 = zx;
    vec2 zy1 = zy;
    uint i = 0u;
    while ((ds_add(ds_mul(zx,zx),ds_mul(zy,zy)).x<16.0)&&(i<256u)) {
        zx1=ds_add(cx,ds_sub(ds_mul(zx,zx),ds_mul(zy,zy)));
        zy1=ds_add(cy,ds_mul(two,ds_mul(zx,zy)));
        zx=zx1;zy=zy1;
        i++;
    }
    vec2 ox = ds_add(cx,ds_mul(ds_sub(zx,cx),vec2(0.1,0.0)));
    vec2 oy = ds_add(cy,ds_mul(ds_sub(zy,cy),vec2(0.1,0.0)));
    return (vec2(ox.x,oy.x)+1.0)/2.0;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 res = iResolution.xy;
    vec2 uv = fragCoord/res;
    vec2 p = transform(uv)*res;
    vec2 p00 = vec2(floor(p.x),floor(p.y))/res;
    vec2 p01 = vec2(floor(p.x),ceil(p.y))/res;
    vec2 p10 = vec2(ceil(p.x),floor(p.y))/res;
    vec2 p11 = vec2(ceil(p.x),ceil(p.y))/res;
    vec2 q = mod(p,1.0);
    vec4 a00 = texture(iChannel0,p00);
    vec4 a01 = texture(iChannel0,p01);
    vec4 a10 = texture(iChannel0,p10);
    vec4 a11 = texture(iChannel0,p11);
    vec4 a = mix(mix(a00,a01,q.y),mix(a10,a11,q.y),q.x);
    vec4 b = texture(iChannel1,uv);
    fragColor = mix(a,b,1.0/64.0);
}
// file 1; main
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = texture(iChannel0,uv).rgb;

    // Output to screen
    fragColor = vec4(col,1.0);
}
// file 2; buffer A
vec2 transform(vec2 xy) {
    return vec2(xy.x,xy.y)
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = vec4(0.0,0.0,1.0,1.0);
}
// file 2; main
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}
