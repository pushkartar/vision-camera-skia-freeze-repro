# Vision Camera Skia Freeze Repro

Minimal Expo + CNG repro for a `react-native-vision-camera` `useSkiaFrameProcessor` preview freeze.

## What This App Does

- Requests camera permission
- Opens the back camera
- Applies a very basic invert-color Skia shader using the documented `frame.render(paint)` pattern

Expected behavior:
- Live preview stays active with inverted colors

Actual behavior on the affected environment:
- Preview opens
- Inverted effect appears
- Preview freezes after about one second
- On new architecture, an additional warning is logged:
  - `<Canvas onLayout={onLayout} /> is not supported on the new architecture...`
  - This appears to come from Vision Camera's internal `SkiaCameraCanvas` implementation, not from app code in this repro.

## Versions

- `expo`: `~54.0.27`
- `react-native`: `0.81.5`
- `react`: `19.1.0`
- `react-native-vision-camera`: `^4.7.3`
- `@shopify/react-native-skia`: `2.2.12`
- `react-native-reanimated`: `^4.2.0`
- `react-native-worklets-core`: `^1.6.3`
- `react-native-worklets`: `0.7.1`
- `newArchEnabled`: `true`

## Run

```bash
npm install
npx expo run:ios
```

Or on Android:

```bash
npm install
npx expo run:android
```

## Repro Steps

1. Launch the app.
2. Tap `Allow Camera Access` / `Open Camera`.
3. Observe the live preview.

## Relevant Code

- [`App.tsx`](./App.tsx)

The frame processor is intentionally minimal:

```ts
const frameProcessor = useSkiaFrameProcessor((frame) => {
  'worklet'
  frame.render(shaderPaint)
}, [shaderPaint])
```

## Notes

- This app uses Expo CNG via `expo run:*`.
- The repro is focused only on the live preview path.
- No photo capture, overlay system, or app-specific infrastructure is included.
