# Future: Real-Time Voice Enhancement

This document outlines how the current batch/offline pipeline could be adapted for real-time use cases.

## Why the Current Pipeline is Slow for Real-Time

The current implementation processes audio in a **batch/offline** manner:

1. **Full-file ML models**: Demucs (`htdemucs_ft`) and DeepFilterNet process the entire audio file at once
2. **Sequential stages**: Each stage completes fully before the next begins
3. **High-quality models**: The `high` preset runs at ~0.1x realtime (10 seconds of audio takes ~100 seconds to process)

## How Real-Time Voice Enhancers Work

Real-time systems use fundamentally different architectures:

### 1. Stream-Based / Chunked Processing

Instead of processing a whole file, real-time systems work on tiny **chunks** (called "frames" or "blocks"):
- Typically **10-30ms chunks** (e.g., 480 samples at 48kHz = 10ms)
- Process each chunk before the next arrives
- Total latency budget: usually **<50ms** for live conversation

### 2. Lightweight Models

Real-time systems use much smaller neural networks:
- **RNNoise** (Mozilla): Tiny recurrent network, runs on CPU in real-time
- **NVIDIA RTX Voice / Broadcast**: GPU-accelerated but optimized for streaming
- **Krisp**: Proprietary, uses efficient CNN architectures
- **WebRTC's built-in AEC/NS**: Classic DSP, extremely fast

These trade quality for speed. DeepFilterNet can actually run in real-time mode, but Demucs cannot.

### 3. Ring Buffers & Overlap-Add

Real-time audio uses circular buffers:

```
Input → [Ring Buffer] → Process Chunk → [Ring Buffer] → Output
              ↑                              ↓
         Audio In                       Audio Out
```

Overlap-add (OLA) techniques prevent clicks between chunks.

### 4. Causal Processing Only

The current pipeline can "look ahead" at future audio. Real-time systems **cannot**:
- No lookahead limiters (or very short ones, adding latency)
- Causal filters only (no zero-phase filtering)
- No full-file loudness normalization (must use running estimates)

### 5. Fixed Latency Pipelines

Real-time systems have a fixed, predictable delay:

```
[Chunk N arrives] → Process → [Chunk N outputs 20ms later]
```

Common latencies:
- **10-20ms**: Imperceptible for conversation
- **30-50ms**: Acceptable for most uses
- **>100ms**: Noticeable, problematic for live talk

### 6. Callback-Based Audio I/O

Instead of reading files, real-time systems use audio callbacks:

```python
# Pseudocode - how real-time audio works
def audio_callback(input_chunk, output_chunk):
    # You have ~5ms to process this!
    enhanced = lightweight_denoise(input_chunk)
    output_chunk[:] = enhanced
```

Libraries like **PortAudio**, **sounddevice**, or **PyAudio** provide this.

## Migration Path: Current → Real-Time

| Current Approach | Real-Time Equivalent |
|------------------|---------------------|
| Demucs (full-file ML separation) | Skip, or use a streaming vocal isolator |
| DeepFilterNet (full enhance) | DeepFilterNet **streaming mode** or RNNoise |
| Spectral gating (noisereduce) | Per-frame spectral subtraction |
| Full-file compression/limiting | Streaming compressor with ~5ms lookahead |
| LUFS normalization | Running loudness estimate + auto-gain |

## Real-Time Frameworks to Consider

1. **RNNoise** - Open source, very lightweight, CPU-only
2. **DeepFilterNet** - Has a real-time mode (`deep-filter --rt`)
3. **NVIDIA Broadcast SDK** - If targeting NVIDIA GPUs
4. **speexdsp** - Classic DSP-based noise suppression
5. **WebRTC Audio Processing Module** - Battle-tested, used in browsers

## Summary

The current pipeline prioritizes **quality** over **speed** by using large ML models on complete files. Real-time enhancers flip this tradeoff: they use tiny models, process audio in small chunks (<30ms), and accept some quality loss to guarantee the output is ready before the next chunk arrives.

A real-time version would likely keep only the DSP stage (with modifications for streaming) and swap Demucs/DeepFilterNet for something like RNNoise or DeepFilterNet's streaming mode.
