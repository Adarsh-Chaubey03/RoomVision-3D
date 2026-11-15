Drop GLB files here to replace the procedural furniture:

  sofa.glb     bed.glb      table.glb    chair.glb
  wardrobe.glb plant.glb    lamp.glb     picture.glb
  carpet.glb

Each model is normalised automatically (centred, standing on y=0, scaled to
the catalog dimensions). Draco and Meshopt compressed files are supported.

Optionally add a models.json to control per-kind rotation and fit mode:

  {
    "sofa":  { "rotateY": 180, "fit": "contain" },
    "chair": { "rotateY": 90 }
  }

The 3D models panel in the editor shows what was loaded and lets you rotate
a model by 90° if its front faces the wrong way. Use "Copy models.json" to
save the result here.
