import * as THREE from "three";

/**
 * Stylized surface shading: triplanar detail plus a rim light.
 *
 * Triplanar detail. The world's geometry is merged per language into one
 * mesh each — the whole reason it costs five draw calls instead of hundreds
 * — and that merge throws away any hope of a single continuous UV layout: a
 * box's UVs and an icosahedron's UVs do not agree, and after
 * `mergeGeometries` there is no seam-free way to unwrap the result even if
 * they did. Triplanar sampling sidesteps the question entirely: it projects
 * the detail texture from world space along all three axes and blends by how
 * much each face's normal points along each one, so it does not need UVs to
 * already make sense.
 *
 * Rim light. A cel-shaded surface without one reads as flat cardboard — the
 * silhouette edge needs a bright line separating it from what is behind it,
 * the way an inked outline does in the 2D version of this style. Computed as
 * a fresnel term against the view direction, so it appears exactly where a
 * silhouette edge is, on every structure, without needing per-object setup.
 *
 * Both are applied via `onBeforeCompile` rather than a custom ShaderMaterial,
 * so everything the base material already does correctly — toon banding,
 * fog, tone mapping, the postprocessing chain reading its depth and normal
 * buffers — keeps working unmodified.
 */
export function applyTriplanarDetail(
  material: THREE.Material,
  texture: THREE.Texture,
  scale: number,
  strength: number,
  rim?: { color: THREE.Color | string; strength: number },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDetailMap = { value: texture };
    shader.uniforms.uDetailScale = { value: scale };
    shader.uniforms.uDetailStrength = { value: strength };
    shader.uniforms.uRimColor = { value: new THREE.Color(rim?.color ?? "#ffffff") };
    shader.uniforms.uRimStrength = { value: rim?.strength ?? 0 };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vTriWorldPos;
         varying vec3 vTriNormal;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vTriWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vTriNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform sampler2D uDetailMap;
         uniform float uDetailScale;
         uniform float uDetailStrength;
         uniform vec3 uRimColor;
         uniform float uRimStrength;
         varying vec3 vTriWorldPos;
         varying vec3 vTriNormal;

         float triplanarDetail() {
           vec3 n = abs(normalize(vTriNormal));
           n = n / (n.x + n.y + n.z + 1e-5);
           vec2 uvX = vTriWorldPos.zy * uDetailScale;
           vec2 uvY = vTriWorldPos.xz * uDetailScale;
           vec2 uvZ = vTriWorldPos.xy * uDetailScale;
           float dx = texture2D(uDetailMap, uvX).r;
           float dy = texture2D(uDetailMap, uvY).r;
           float dz = texture2D(uDetailMap, uvZ).r;
           return dx * n.x + dy * n.y + dz * n.z;
         }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         {
           float d = triplanarDetail();
           diffuseColor.rgb *= mix(1.0, d * 1.55, uDetailStrength);
         }`,
      )
      .replace(
        "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;",
        `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
         {
           vec3 viewDir = normalize(vViewPosition);
           float fres = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 2.6);
           outgoingLight += uRimColor * fres * uRimStrength;
         }`,
      );
  };
  // Materials cache their compiled program by a hash that does not include
  // onBeforeCompile's body, so a material that already compiled once this
  // session needs telling explicitly that its shader changed.
  material.needsUpdate = true;
}
