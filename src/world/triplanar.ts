import * as THREE from "three";

/**
 * Triplanar detail.
 *
 * The world's geometry is merged per language into one mesh each — the
 * whole reason it costs five draw calls instead of hundreds — and that merge
 * throws away any hope of a single continuous UV layout: a box's UVs and an
 * icosahedron's UVs do not agree, and after `mergeGeometries` there is no
 * seam-free way to unwrap the result even if they did. Triplanar sampling
 * sidesteps the question entirely: it projects the detail texture from world
 * space along all three axes and blends by how much each face's normal
 * points along each one, so it does not need UVs to already make sense.
 *
 * Applied via `onBeforeCompile` rather than a custom ShaderMaterial, so
 * everything MeshStandardMaterial already does correctly — the PBR
 * lighting model, fog, tone mapping, the postprocessing chain reading its
 * depth and normal buffers — keeps working unmodified. This only adds one
 * multiply into `diffuseColor` after the vertex colour has already been
 * applied, which is deliberate: the per-language tint and the baked
 * ambient-occlusion gradient are the world's real information, and the
 * detail texture is surface grain sitting on top of it, not a replacement.
 */
export function applyTriplanarDetail(
  material: THREE.MeshStandardMaterial,
  texture: THREE.Texture,
  scale: number,
  strength: number,
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDetailMap = { value: texture };
    shader.uniforms.uDetailScale = { value: scale };
    shader.uniforms.uDetailStrength = { value: strength };

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
      );
  };
  // MeshStandardMaterial caches its compiled program by a hash that does not
  // include onBeforeCompile's body, so a material that already compiled once
  // this session needs telling explicitly that its shader changed.
  material.needsUpdate = true;
}
