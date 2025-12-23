"""Loudness normalization stage using LUFS targeting."""

import numpy as np
import pyloudnorm as pyln
from rich.console import Console

from ..utils.audio import AudioData

console = Console()


class LoudnessNormalizer:
    """Normalize audio loudness to a target LUFS level.

    Uses ITU-R BS.1770-4 standard for loudness measurement,
    which is the industry standard for broadcast and streaming.
    """

    def __init__(self, target_lufs: float = -16.0, true_peak_max: float = -1.0):
        """Initialize the loudness normalizer.

        Args:
            target_lufs: Target loudness in LUFS
                Common targets:
                - -16 LUFS: Podcasts, voice-over (recommended)
                - -14 LUFS: YouTube, Spotify
                - -23 LUFS: Broadcast (EBU R128)
            true_peak_max: Maximum true peak in dBTP
                - -1 dBTP is standard to prevent clipping on lossy codecs
        """
        self.target_lufs = target_lufs
        self.true_peak_max = true_peak_max

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Normalize audio to target loudness.

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Normalized AudioData
        """
        if verbose:
            console.print(
                f"  Normalizing loudness to {self.target_lufs} LUFS...", style="dim"
            )

        samples = audio.samples
        sr = audio.sample_rate

        # Create loudness meter
        meter = pyln.Meter(sr)

        # Measure current loudness
        current_lufs = meter.integrated_loudness(samples)

        if verbose:
            console.print(f"    Current loudness: {current_lufs:.1f} LUFS", style="dim")

        # Handle silent or very quiet audio
        if current_lufs == float("-inf") or np.isnan(current_lufs):
            if verbose:
                console.print(
                    "    Audio too quiet for loudness measurement, skipping normalization",
                    style="yellow",
                )
            return audio.copy()

        # Normalize to target LUFS
        normalized = pyln.normalize.loudness(samples, current_lufs, self.target_lufs)

        # Apply true peak limiting if needed
        true_peak = self._measure_true_peak(normalized, sr)
        true_peak_db = 20 * np.log10(true_peak) if true_peak > 0 else float("-inf")

        if verbose:
            console.print(f"    True peak: {true_peak_db:.1f} dBTP", style="dim")

        if true_peak_db > self.true_peak_max:
            # Reduce gain to meet true peak requirement
            reduction_db = true_peak_db - self.true_peak_max
            reduction_linear = 10 ** (-reduction_db / 20)
            normalized = normalized * reduction_linear

            if verbose:
                console.print(
                    f"    Applied {reduction_db:.1f}dB reduction for true peak compliance",
                    style="dim",
                )

        # Verify final loudness
        final_lufs = meter.integrated_loudness(normalized)

        if verbose:
            console.print(f"    Final loudness: {final_lufs:.1f} LUFS", style="dim")
            console.print("  Loudness normalization complete", style="dim")

        return AudioData(
            samples=normalized.astype(np.float32),
            sample_rate=sr,
            original_file=audio.original_file,
        )

    def _measure_true_peak(self, samples: np.ndarray, sr: int) -> float:
        """Measure the true peak of audio using oversampling.

        Args:
            samples: Audio samples
            sr: Sample rate

        Returns:
            True peak value (linear, not dB)
        """
        # Simple 4x oversampling for true peak measurement
        from scipy import signal

        upsampled = signal.resample(samples, len(samples) * 4)
        return float(np.max(np.abs(upsampled)))


class BroadcastNormalizer(LoudnessNormalizer):
    """Normalizer preset for broadcast (EBU R128)."""

    def __init__(self):
        super().__init__(target_lufs=-23.0, true_peak_max=-1.0)


class PodcastNormalizer(LoudnessNormalizer):
    """Normalizer preset for podcasts and voice-over."""

    def __init__(self):
        super().__init__(target_lufs=-16.0, true_peak_max=-1.0)


class StreamingNormalizer(LoudnessNormalizer):
    """Normalizer preset for streaming platforms (YouTube, Spotify)."""

    def __init__(self):
        super().__init__(target_lufs=-14.0, true_peak_max=-1.0)
