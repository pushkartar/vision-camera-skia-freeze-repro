import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Skia} from '@shopify/react-native-skia';
import {
  Camera,
  Templates,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera';

const INVERT_SHADER = `
uniform shader image;

half4 main(vec2 pos) {
  vec4 color = image.eval(pos);
  return vec4((1.0 - color.rgb), color.a);
}
`;

export default function App() {
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, Templates.FrameProcessing);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const shaderPaint = useMemo(() => {
    const effect = Skia.RuntimeEffect.Make(INVERT_SHADER);
    if (!effect) {
      return null;
    }

    const builder = Skia.RuntimeShaderBuilder(effect);
    const imageFilter = Skia.ImageFilter.MakeRuntimeShader(builder, null, null);
    if (!imageFilter) {
      return null;
    }

    const paint = Skia.Paint();
    paint.setImageFilter(imageFilter);
    return paint;
  }, []);

  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      if (!shaderPaint) {
        frame.render();
        return;
      }
      frame.render(shaderPaint);
    },
    [shaderPaint],
  );

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    setCameraEnabled(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Vision Camera Skia Freeze Repro</Text>
        <Text style={styles.subtitle}>
          Tap the button below. The live preview should invert colors. In the buggy case, it
          freezes after about one second.
        </Text>
      </View>

      <View style={styles.preview}>
        {cameraEnabled && device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            format={format}
            fps={15}
            isActive
            video
            frameProcessor={frameProcessor}
          />
        ) : (
          <View style={styles.placeholder}>
            {!device ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.placeholderText}>Waiting for camera device…</Text>
              </>
            ) : (
              <>
                <Text style={styles.placeholderText}>Camera idle</Text>
                <Pressable style={styles.button} onPress={handleOpenCamera}>
                  <Text style={styles.buttonText}>
                    {hasPermission ? 'Open Camera' : 'Allow Camera Access'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1014',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#b9bfd0',
    fontSize: 15,
    lineHeight: 22,
  },
  preview: {
    flex: 1,
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1c22',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
});
