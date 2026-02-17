package com.aira.app.face;

import android.app.Activity;
import android.graphics.Color;
import android.media.Image;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.camera.core.*;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.*;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class FaceDetectionModule extends ReactContextBaseJavaModule {

    private enum Step {
        ALIGN_FACE,
        HOLD_STEADY,
        TURN_LEFT,
        TURN_RIGHT,
        VERIFIED
    }

    private Step currentStep = Step.ALIGN_FACE;
    private int stableFrames = 0;
    private static final int REQUIRED_FRAMES = 15;

    private PreviewView previewView;
    private ViewGroup rootView;
    private ProcessCameraProvider cameraProvider;
    private ExecutorService cameraExecutor;
    private FaceDetector faceDetector;

    private final ReactApplicationContext reactContext;

    public FaceDetectionModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;

        FaceDetectorOptions options =
                new FaceDetectorOptions.Builder()
                        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                        .enableTracking()
                        .build();

        faceDetector = FaceDetection.getClient(options);
        cameraExecutor = Executors.newSingleThreadExecutor();
    }

    @NonNull
    @Override
    public String getName() {
        return "FaceDetection";
    }

    @ReactMethod
    public void startCamera() {
        Activity activity = getCurrentActivity();
        if (activity == null) return;

        activity.runOnUiThread(() -> {
            if (activity.getWindow() != null) {
                activity.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
                activity.getWindow().setStatusBarColor(Color.TRANSPARENT);
            }
            previewView = new PreviewView(activity);
            previewView.setLayoutParams(
                    new FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT
                    )
            );

            rootView =
                    (ViewGroup) activity.findViewById(android.R.id.content);

            // Make entire RN hierarchy transparent so camera shows through (Aira has Navigator layers)
            setViewTreeTransparent(rootView, true);

            rootView.addView(previewView, 0);
            bindCamera(activity);
        });
    }

    @ReactMethod
    public void stopCamera() {
        Activity activity = getCurrentActivity();
        if (activity == null) return;

        activity.runOnUiThread(() -> {
            try {
                if (cameraProvider != null) {
                    cameraProvider.unbindAll();
                    cameraProvider = null;
                }
                if (rootView != null && previewView != null && previewView.getParent() == rootView) {
                    rootView.removeView(previewView);
                }
                previewView = null;
                currentStep = Step.ALIGN_FACE;
                stableFrames = 0;
                if (activity.getWindow() != null) {
                    activity.getWindow().setBackgroundDrawableResource(android.R.color.white);
                }
                rootView = null;
                // Do NOT call setViewTreeTransparent(content, false) - it overwrites every RN view
                // background with white and causes a blank white screen after liveness success.
            } catch (Exception e) {
                Log.e("LIVENESS", "stopCamera failed", e);
            }
        });
    }

    private void bindCamera(Activity activity) {
        ListenableFuture<ProcessCameraProvider> future =
                ProcessCameraProvider.getInstance(activity);

        future.addListener(() -> {
            try {
                ProcessCameraProvider provider = future.get();
                cameraProvider = provider;

                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());

                ImageAnalysis analysis =
                        new ImageAnalysis.Builder()
                                .setBackpressureStrategy(
                                        ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                .build();

                analysis.setAnalyzer(cameraExecutor, this::analyze);

                CameraSelector selector =
                        new CameraSelector.Builder()
                                .requireLensFacing(CameraSelector.LENS_FACING_FRONT)
                                .build();

                provider.unbindAll();
                provider.bindToLifecycle(
                        (androidx.lifecycle.LifecycleOwner) activity,
                        selector,
                        preview,
                        analysis
                );

            } catch (Exception e) {
                Log.e("LIVENESS", "Camera bind failed", e);
            }
        }, ContextCompat.getMainExecutor(activity));
    }

    private void analyze(ImageProxy proxy) {
        Image img = proxy.getImage();
        if (img == null) {
            proxy.close();
            return;
        }

        InputImage image =
                InputImage.fromMediaImage(
                        img,
                        proxy.getImageInfo().getRotationDegrees()
                );

        faceDetector.process(image)
                .addOnSuccessListener(faces -> {

                    if (faces.size() != 1) {
                        reset();
                        emit("ALIGN_FACE");
                        return;
                    }

                    Face face = faces.get(0);

                    float yaw = face.getHeadEulerAngleY();

                    switch (currentStep) {

                        case ALIGN_FACE:
                            stableFrames++;
                            if (stableFrames >= REQUIRED_FRAMES) {
                                moveTo(Step.HOLD_STEADY);
                            }
                            break;

                        case HOLD_STEADY:
                            stableFrames++;
                            if (stableFrames >= REQUIRED_FRAMES) {
                                moveTo(Step.TURN_LEFT);
                            }
                            break;

                        case TURN_LEFT:
                            if (yaw < -15) {
                                stableFrames++;
                                if (stableFrames >= REQUIRED_FRAMES) {
                                    moveTo(Step.TURN_RIGHT);
                                }
                            } else stableFrames = 0;
                            break;

                        case TURN_RIGHT:
                            if (yaw > 15) {
                                stableFrames++;
                                if (stableFrames >= REQUIRED_FRAMES) {
                                    moveTo(Step.VERIFIED);
                                }
                            } else stableFrames = 0;
                            break;

                        case VERIFIED:
                            break;
                    }

                    Log.d("LIVENESS",
                            "step=" + currentStep +
                            " yaw=" + yaw +
                            " frames=" + stableFrames
                    );
                })
                .addOnCompleteListener(t -> proxy.close());
    }

    private void moveTo(Step next) {
        currentStep = next;
        stableFrames = 0;
        emit(next.name());
    }

    private void reset() {
        currentStep = Step.ALIGN_FACE;
        stableFrames = 0;
    }

    private void emit(String step) {
        WritableMap map = Arguments.createMap();
        map.putString("step", step);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("LIVENESS_STEP", map);
    }

    /** Set entire view tree transparent (or restore white) so camera shows through RN. */
    private void setViewTreeTransparent(ViewGroup root, boolean transparent) {
        root.setBackgroundColor(transparent ? Color.TRANSPARENT : Color.WHITE);
        for (int i = 0; i < root.getChildCount(); i++) {
            View child = root.getChildAt(i);
            child.setBackgroundColor(transparent ? Color.TRANSPARENT : Color.WHITE);
            if (child instanceof ViewGroup) {
                setViewTreeTransparent((ViewGroup) child, transparent);
            }
        }
    }
}
