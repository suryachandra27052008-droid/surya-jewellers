# Ring Images for Virtual Try-On

Place ring overlay images here for the virtual try-on feature.

## Naming convention

Name each file after the product's slug or `_id`:

```
public/rings/<ringId>.png
```

## Requirements

- **Format**: PNG with transparent background (RGBA)
- **Size**: 512×512 px recommended
- **Style**: Top-down or slight angle view of the ring on a transparent background

If no image is found for a ring, the try-on page will render a gold circle placeholder overlay.
