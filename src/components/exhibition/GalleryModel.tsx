"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Material, Mesh, MeshPhongMaterial } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const MODEL_URL = "/galleries/rounded-room/gallery.obj";
const MATERIAL_URL = "/galleries/rounded-room/gallery.mtl";

function prepareMaterial(material: Material) {
  if (!(material instanceof MeshPhongMaterial)) {
    return;
  }

  material.shininess = Math.min(material.shininess, 8);

  if (material.name === "ground_1") {
    material.color.set("#666662");
  } else if (material.name === "wall_1_2") {
    material.color.set("#d1d0ca");
  } else if (material.name === "white") {
    material.color.set("#b9b8b2");
  }
}

export function GalleryModel() {
  const materials = useLoader(MTLLoader, MATERIAL_URL);
  const source = useLoader(OBJLoader, MODEL_URL, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
  const model = useMemo(() => source.clone(true), [source]);

  useEffect(() => {
    const duplicateDoorFrame = model.getObjectByName("Montant_87");

    if (duplicateDoorFrame) {
      duplicateDoorFrame.visible = false;
    }

    model.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.receiveShadow = true;
      const childMaterials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      childMaterials.forEach(prepareMaterial);
    });
  }, [model]);

  return (
    <primitive
      object={model}
      position={[-3.446961, 0, -10.988934]}
      scale={0.01}
    />
  );
}

useLoader.preload(MTLLoader, MATERIAL_URL);
