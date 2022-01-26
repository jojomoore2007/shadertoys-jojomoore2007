const int m = 32;
const vec3 viewport = vec3(0.0,0.0,5.0);
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float t = log(iTime+1.0)/log(1.05);
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (((fragCoord-(iResolution.xy/2.0))/iResolution.x)*viewport.z)+viewport.xy;
    float col = 0.0;
    // Time varying pixel color
    vec2 z = vec2(0.0,0.0);
    for (int i = 0; i < min(int(t),m); i++) {
        z=vec2((z.x*z.x)-(z.y*z.y),2.0*z.x*z.y)+uv;
        if (distance(vec2(0.0,0.0),z)<2.0) {
            col=float(i);
        }
    }

    // Output to screen
    fragColor = vec4(1.0-vec3(col/float(min(int(t),m)-1)),1.0);
}
