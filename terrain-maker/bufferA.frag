void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor=texture(iChannel1,fragCoord/iResolution.xy);
}
