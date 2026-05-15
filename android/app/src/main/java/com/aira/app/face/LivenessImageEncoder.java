package com.aira.app.face;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;

/**
 * Encodes one CameraX {@link ImageProxy} (YUV_420_888) to JPEG bytes for liveness upload.
 */
public final class LivenessImageEncoder {

    private static final String TAG = "LIVENESS";

    private LivenessImageEncoder() {}

    /**
     * @return file:// URI string, or null on failure
     */
    @Nullable
    public static String encodeYuv420888ToJpegFile(ImageProxy imageProxy, File outFile, int quality) {
        try {
            Rect crop = imageProxy.getCropRect();
            byte[] nv21 = yuv420888ToNv21(imageProxy);
            if (nv21 == null) return null;

            int width = crop.width();
            int height = crop.height();
            YuvImage yuv = new YuvImage(nv21, ImageFormat.NV21, width, height, null);
            ByteArrayOutputStream jpegStream = new ByteArrayOutputStream();
            yuv.compressToJpeg(new Rect(0, 0, width, height), quality, jpegStream);
            byte[] jpegBytes = jpegStream.toByteArray();

            Bitmap sensor = BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.length);
            if (sensor == null) return null;

            int rotation = imageProxy.getImageInfo().getRotationDegrees();
            Bitmap upright = uprightPortraitBitmap(sensor, rotation, true);
            if (upright == null) return null;

            FileOutputStream fos = new FileOutputStream(outFile);
            upright.compress(Bitmap.CompressFormat.JPEG, quality, fos);
            fos.flush();
            fos.close();
            if (upright != sensor) upright.recycle();
            sensor.recycle();
            return android.net.Uri.fromFile(outFile).toString();
        } catch (Exception e) {
            Log.e(TAG, "encodeYuv420888ToJpegFile failed", e);
            return null;
        }
    }

    /** Rotate sensor buffer to portrait, then mirror for front camera (matches preview). */
    @Nullable
    private static Bitmap uprightPortraitBitmap(Bitmap source, int rotationDegrees, boolean mirrorFront) {
        try {
            Matrix rotate = new Matrix();
            rotate.postRotate(rotationDegrees);
            Bitmap rotated =
                    Bitmap.createBitmap(
                            source, 0, 0, source.getWidth(), source.getHeight(), rotate, true);
            if (!mirrorFront) {
                return rotated;
            }
            Matrix mirror = new Matrix();
            mirror.preScale(-1f, 1f);
            Bitmap mirrored =
                    Bitmap.createBitmap(
                            rotated, 0, 0, rotated.getWidth(), rotated.getHeight(), mirror, true);
            rotated.recycle();
            return mirrored;
        } catch (Exception e) {
            Log.e(TAG, "uprightPortraitBitmap failed", e);
            return null;
        }
    }

    /**
     * Converts YUV_420_888 (I420-style plane layout) to NV21 byte array expected by {@link YuvImage}.
     * Adapted from Android camera plane packing patterns.
     */
    @Nullable
    private static byte[] yuv420888ToNv21(ImageProxy image) {
        try {
            Rect crop = image.getCropRect();
            int width = crop.width();
            int height = crop.height();
            ImageProxy.PlaneProxy[] planes = image.getPlanes();
            if (planes.length < 3) return null;

            byte[] out = new byte[width * height + width * height / 2];
            int outPos = 0;

            // --- Y ---
            ImageProxy.PlaneProxy yPlane = planes[0];
            ByteBuffer yBuf = yPlane.getBuffer();
            int yRowStride = yPlane.getRowStride();
            int yPixStride = yPlane.getPixelStride();
            for (int row = 0; row < height; row++) {
                int rowStart = (crop.top + row) * yRowStride + crop.left * yPixStride;
                for (int col = 0; col < width; col++) {
                    out[outPos++] = yBuf.get(rowStart + col * yPixStride);
                }
            }

            // --- interleaved VU for NV21 (NV21 = Y + interleaved VU) ---
            ImageProxy.PlaneProxy uPlane = planes[1];
            ImageProxy.PlaneProxy vPlane = planes[2];
            ByteBuffer uBuf = uPlane.getBuffer();
            ByteBuffer vBuf = vPlane.getBuffer();
            int uRowStride = uPlane.getRowStride();
            int uPixStride = uPlane.getPixelStride();
            int vRowStride = vPlane.getRowStride();
            int vPixStride = vPlane.getPixelStride();

            int chromaHeight = height / 2;
            int chromaWidth = width / 2;
            for (int row = 0; row < chromaHeight; row++) {
                for (int col = 0; col < chromaWidth; col++) {
                    int uRow = crop.top / 2 + row;
                    int uCol = crop.left / 2 + col;
                    int vRow = crop.top / 2 + row;
                    int vCol = crop.left / 2 + col;
                    int uIndex = uRow * uRowStride + uCol * uPixStride;
                    int vIndex = vRow * vRowStride + vCol * vPixStride;
                    byte vVal = vBuf.get(vIndex);
                    byte uVal = uBuf.get(uIndex);
                    out[outPos++] = vVal;
                    out[outPos++] = uVal;
                }
            }
            return out;
        } catch (Exception e) {
            Log.e(TAG, "yuv420888ToNv21 failed", e);
            return null;
        }
    }

    /** Fallback when YUV encode fails (e.g. unexpected plane layout). */
    @Nullable
    public static String bitmapToJpegFile(Bitmap bmp, File outFile, int quality) {
        if (bmp == null) return null;
        try {
            FileOutputStream fos = new FileOutputStream(outFile);
            bmp.compress(Bitmap.CompressFormat.JPEG, quality, fos);
            fos.flush();
            fos.close();
            return android.net.Uri.fromFile(outFile).toString();
        } catch (Exception e) {
            Log.e(TAG, "bitmapToJpegFile failed", e);
            return null;
        }
    }
}
