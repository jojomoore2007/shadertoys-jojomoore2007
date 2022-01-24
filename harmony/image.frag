#define HALF_PI 1.5707963267948966192313
#define      PI 3.1415926535897932384626
#define  TWO_PI 6.2831853071795864769252

vec2 sound( int samp, float time )
{
    // harmony
    float[12] waves;
    float amul = 0.5;
    float fmul = 0.5;
    waves[0]=1.0;
    waves[1]=440.0*pow(2.0,(float(int(time)))/12.0);
    for (int i = 1; i < 6; i++) {
        waves[2*i+0]=waves[2*i-2]*amul;
        waves[2*i+1]=waves[2*i-1]*fmul;
    }
    float v = 0.0;
    float n = 0.0;
    float x;
    for (int i = 0; i < 6; i++) {
        x=sin(TWO_PI*waves[2*i+1]*time);
        v+=x*waves[2*i];
        n+=waves[2*i];
    }
    v/=n;
    return vec2(cos(time),sin(time))*v;
    //return vec2( v*exp(-3.0*time) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord/iResolution.xy)-vec2(0.0,0.5);
    vec2 snd = sound(0,(iTime/4.0)+(uv.x/32.0));
    float sndL = (atan((snd.x-uv.y)*128.0)+1.0)/2.0;
    float sndA = (atan((((snd.x+snd.y)/2.0)-uv.y)*128.0)+1.0)/2.0;
    float sndR = (atan((snd.y-uv.y)*128.0)+1.0)/2.0;
    // Time varying pixel color
    vec3 col = vec3(sndL,sndA,sndR);

    // Output to screen
    fragColor = vec4(col,1.0);
}
