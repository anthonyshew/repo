# Voice Enhancer

Transform noisy audio recordings into professional "recording booth" quality voice audio.

## Features

- **Voice Isolation**: Separates voice from background noise, music, and other sounds using Demucs ML model
- **Deep Denoising**: Removes remaining noise using DeepFilterNet neural network
- **Residual Cleanup**: Catches any remaining artifacts with spectral gating
- **Professional DSP**: Applies broadcast-quality EQ, compression, and limiting
- **Loudness Normalization**: Targets industry-standard LUFS levels (default: -16 LUFS for podcasts)

## Requirements

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- ffmpeg (for MP3 support)

### Installing ffmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

## Installation

```bash
# From the voice-enhancer directory
cd apps/voice-enhancer

# Install dependencies with uv
uv sync
```

## Usage

### Basic Usage

```bash
# Enhance an audio file (outputs to input_enhanced.wav by default)
uv run voice-enhancer recording.mp3

# Specify output file
uv run voice-enhancer interview.wav -o clean_interview.wav

# Output as MP3
uv run voice-enhancer podcast.wav -f mp3
```

### Quality Presets

```bash
# High quality (default) - best results, slowest
uv run voice-enhancer recording.mp3 -q high

# Balanced - good quality, moderate speed
uv run voice-enhancer recording.mp3 -q balanced

# Fast - quick cleanup, skips ML separation
uv run voice-enhancer recording.mp3 -q fast
```

| Preset | Voice Separation | Denoising | Speed | Use Case |
|--------|------------------|-----------|-------|----------|
| `fast` | Skip | noisereduce only | ~2x realtime | Already-clean voice |
| `balanced` | Demucs htdemucs | DeepFilterNet | ~0.5x realtime | General use |
| `high` | Demucs htdemucs_ft | DeepFilterNet | ~0.1x realtime | Best quality |

### Advanced Options

```bash
# Skip voice separation (if input is already voice-only)
uv run voice-enhancer voice_memo.wav --skip-separation

# Custom loudness target
uv run voice-enhancer podcast.wav --target-lufs -14  # YouTube/Spotify
uv run voice-enhancer broadcast.wav --target-lufs -23  # EBU R128 broadcast

# Keep intermediate files (for debugging/comparison)
uv run voice-enhancer noisy.mp3 --keep-intermediate

# Verbose output
uv run voice-enhancer recording.mp3 -v
```

### All Options

```
Usage: voice-enhancer [OPTIONS] INPUT_FILE

  Enhance voice audio to professional recording booth quality.

  INPUT_FILE: Path to the input audio file (WAV or MP3)

Options:
  -o, --output PATH           Output file path
  -f, --format [wav|mp3]      Output format
  -q, --quality [fast|balanced|high]
                              Quality preset (default: high)
  --target-lufs FLOAT         Target loudness in LUFS (default: -16)
  --skip-separation           Skip voice separation stage
  --keep-intermediate         Keep intermediate files from each stage
  -v, --verbose               Show detailed progress
  --quiet                     Suppress all output except errors
  --version                   Show version
  --help                      Show this message and exit
```

## Processing Pipeline

The voice enhancer uses a 6-stage pipeline:

```
┌─────────────────┐
│   Input Audio   │  WAV or MP3
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 1. Load & Prep  │  Convert to 44.1kHz mono
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Voice        │  Demucs ML model isolates vocals
│    Separation   │  from background sounds
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Deep         │  DeepFilterNet removes
│    Denoising    │  remaining noise
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Residual     │  Spectral gating catches
│    Cleanup      │  any ML artifacts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. DSP Polish   │  • High-pass filter (80Hz)
│                 │  • Presence EQ (+2dB @ 3kHz)
│                 │  • Compression (3:1)
│                 │  • Limiting (-1dB ceiling)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Loudness     │  Normalize to target LUFS
│    Normalize    │  (default: -16 LUFS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output Audio   │  Studio-quality voice
└─────────────────┘
```

## GPU Acceleration

The ML models (Demucs, DeepFilterNet) automatically use GPU if available:

- **CUDA (NVIDIA)**: Install PyTorch with CUDA support for 10-50x faster processing
- **MPS (Apple Silicon)**: Automatic acceleration on M1/M2/M3 Macs
- **CPU**: Works on any system, but slower

To check if GPU is being used, run with `-v` (verbose) flag.

## Loudness Targets

| Use Case | Target LUFS | Notes |
|----------|-------------|-------|
| Podcasts | -16 LUFS | Default, industry standard |
| YouTube | -14 LUFS | Platform recommendation |
| Spotify | -14 LUFS | Normalization target |
| Broadcast (EBU R128) | -23 LUFS | European standard |
| Voice-over | -16 to -14 LUFS | Professional standard |

## Troubleshooting

### "ffmpeg not found" error
Make sure ffmpeg is installed and in your PATH. See installation instructions above.

### Out of memory errors
- Try the `balanced` or `fast` quality preset
- Close other applications
- Process shorter audio files

### Slow processing
- Use GPU acceleration if available (NVIDIA CUDA or Apple Silicon)
- Try the `balanced` or `fast` quality preset
- The `high` preset uses the fine-tuned Demucs model which is 4x slower

### Poor quality results
- Make sure you're using the `high` quality preset
- Try with `--keep-intermediate` to see which stage might be causing issues
- If input is already voice-only, use `--skip-separation` to avoid artifacts

## License

MIT
