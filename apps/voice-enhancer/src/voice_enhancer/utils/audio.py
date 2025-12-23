"""Audio utility functions for voice enhancement."""

from dataclasses import dataclass
from typing import Tuple

import numpy as np
import scipy.signal as signal
from numpy.typing import NDArray


@dataclass
class AudioData:
    """Container for audio data with metadata."""

    samples: NDArray[np.float32]
    sample_rate: int
    original_file: str | None = None

    @property
    def duration(self) -> float:
        """Duration in seconds."""
        return len(self.samples) / self.sample_rate

    @property
    def num_samples(self) -> int:
        """Number of samples."""
        return len(self.samples)

    def copy(self) -> "AudioData":
        """Create a copy of this AudioData."""
        return AudioData(
            samples=self.samples.copy(),
            sample_rate=self.sample_rate,
            original_file=self.original_file,
        )


def convert_to_mono(audio: NDArray[np.float32]) -> NDArray[np.float32]:
    """Convert stereo audio to mono by averaging channels.

    Args:
        audio: Audio array, shape (samples,) or (channels, samples) or (samples, channels)

    Returns:
        Mono audio array, shape (samples,)
    """
    if audio.ndim == 1:
        return audio

    # Handle both (channels, samples) and (samples, channels) formats
    if audio.shape[0] == 2:
        # (channels, samples) format
        return np.mean(audio, axis=0).astype(np.float32)
    elif audio.shape[1] == 2:
        # (samples, channels) format
        return np.mean(audio, axis=1).astype(np.float32)

    # Already mono or unknown format, return as-is flattened
    return audio.flatten().astype(np.float32)


def resample_audio(
    audio: NDArray[np.float32], orig_sr: int, target_sr: int
) -> NDArray[np.float32]:
    """Resample audio to a target sample rate.

    Args:
        audio: Audio samples
        orig_sr: Original sample rate
        target_sr: Target sample rate

    Returns:
        Resampled audio
    """
    if orig_sr == target_sr:
        return audio

    # Calculate the number of samples in the resampled audio
    num_samples = int(len(audio) * target_sr / orig_sr)

    # Use scipy's resample for high-quality resampling
    resampled = signal.resample(audio, num_samples)

    return resampled.astype(np.float32)


def normalize_audio_range(
    audio: NDArray[np.float32], target_peak: float = 0.95
) -> NDArray[np.float32]:
    """Normalize audio to a target peak level.

    Args:
        audio: Audio samples
        target_peak: Target peak level (0.0 to 1.0)

    Returns:
        Normalized audio
    """
    peak = np.max(np.abs(audio))
    if peak > 0:
        return (audio / peak * target_peak).astype(np.float32)
    return audio


def get_audio_info(audio: AudioData) -> dict:
    """Get information about audio data.

    Args:
        audio: AudioData object

    Returns:
        Dictionary with audio information
    """
    samples = audio.samples
    return {
        "duration_seconds": audio.duration,
        "sample_rate": audio.sample_rate,
        "num_samples": audio.num_samples,
        "peak_level": float(np.max(np.abs(samples))),
        "rms_level": float(np.sqrt(np.mean(samples**2))),
        "original_file": audio.original_file,
    }


def audio_to_tensor(audio: AudioData) -> Tuple["torch.Tensor", int]:
    """Convert AudioData to PyTorch tensor.

    Args:
        audio: AudioData object

    Returns:
        Tuple of (tensor, sample_rate)
    """
    import torch

    # Ensure audio is 2D: (1, samples) for mono
    samples = audio.samples
    if samples.ndim == 1:
        samples = samples[np.newaxis, :]

    tensor = torch.from_numpy(samples).float()
    return tensor, audio.sample_rate


def tensor_to_audio(
    tensor: "torch.Tensor", sample_rate: int, original_file: str | None = None
) -> AudioData:
    """Convert PyTorch tensor to AudioData.

    Args:
        tensor: Audio tensor, shape (channels, samples) or (samples,)
        sample_rate: Sample rate
        original_file: Original file path

    Returns:
        AudioData object
    """
    # Convert to numpy
    samples = tensor.detach().cpu().numpy()

    # Convert to mono if needed
    if samples.ndim > 1:
        samples = convert_to_mono(samples)

    return AudioData(
        samples=samples.astype(np.float32),
        sample_rate=sample_rate,
        original_file=original_file,
    )
