# Flower playground

Run `npm --prefix example run dev` and open `/flowers` on the printed local URL. This is an isolated visual proof of concept; it does not change presets or connect to Move.

Choose a flower pattern independently of the palette: Wildflower (lobed clusters), Spiral (golden-angle growth), Pompon (rounded rings), Ribbons (curling narrow petals), or Coral (forked branches and buds). Pattern buttons show live previews using the same seed and controls. The foreground center defaults to 2.75× its previous size; Center size adjusts it without rerolling the other blobs.

The seed is the image's repeatable identity. Design controls redraw that identity immediately; the gallery compares different seeds with the same settings. Choose a limited palette, adjust the geometry, and download a standalone SVG.

The shared renderer lives in `src/preset-flower.ts`; `example/src/flower-generator.ts` re-exports it. It hashes a string into a deterministic random stream, arranges asymmetric curved blobs radially, and stacks smaller rings with a rotational offset. Each flower uses at most four fill colors plus its background. Chaos (100% by default) breaks radial symmetry with seed-specific growth habits, eccentric clusters, lobed outlines, unequal petals, and satellite buds. At zero, the composition returns to a regular layered flower. Each seed has independent random streams per petal so slider edits remain repeatable. The artwork is fitted to the frame using its Bézier control bounds. Other settings control petal count, layers, length, width, roundness, irregularity, twist, and radial spacing. No remote images, canvas dependencies, or image-generation service are required.

For eventual preset integration, use a stable preset ID or canonical serialization of its DNA as the seed, and keep a shared set of design settings. The same seed and settings reproduce exactly the same SVG. The preset exploration grid and morph corners now use this renderer with the approved recipe.

Approved Wildflower recipe: center 2.75×, chaos 100%, 16 petals, 2 layers, length 60, width 20, roundness 50%, irregularity 100%, twist −90°, spread 0%. Opening and Reset design use this recipe. Colors come directly from `src/move-palette.ts`, brought over from upstream; each seed deterministically selects four of the kit’s eight hues, on the kit’s white background. The custom PoC palettes have been removed.
