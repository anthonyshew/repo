"""Residual noise cleanup stage using spectral gating."""

import numpy as np
import noisereduce as nr
from rich.console import Console

from ..utils.audio import AudioData

console = Console()


class ResidualCleaner:
    """Clean up residual noise using spectral gating (noisereduce).

    This stage catches noise that the ML-based denoiser may have missed,
    using traditional spectral gating techniques.
    """

    def __init__(
        self,
        prop_decrease: float = 0.8,
        stationary: bool = False,
        n_fft: int = 2048,
        hop_length: int = 512,
    ):
        """Initialize the residual cleaner.

        Args:
            prop_decrease: Proportion to reduce noise by (0.0 to 1.0)
                Higher values = more aggressive noise reduction
            stationary: Whether to use stationary noise reduction
                False = better for varying noise (recommended)
                True = better for constant background noise
            n_fft: FFT size for spectral analysis
            hop_length: Hop length for spectral analysis
        """
        self.prop_decrease = prop_decrease
        self.stationary = stationary
        self.n_fft = n_fft
        self.hop_length = hop_length

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Apply spectral gating to remove residual noise.

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Cleaned AudioData
        """
        if verbose:
            console.print("  Applying residual noise cleanup...", style="dim")
            console.print(
                f"    Mode: {'stationary' if self.stationary else 'non-stationary'}, "
                f"reduction: {self.prop_decrease * 100:.0f}%",
                style="dim",
            )

        # Apply noise reduction with parallel processing
        cleaned = nr.reduce_noise(
            y=audio.samples,
            sr=audio.sample_rate,
            prop_decrease=self.prop_decrease,
            stationary=self.stationary,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            n_jobs=-1,  # Use all available CPU cores
        )

        if verbose:
            console.print("  Residual cleanup complete", style="dim")

        return AudioData(
            samples=cleaned.astype(np.float32),
            sample_rate=audio.sample_rate,
            original_file=audio.original_file,
        )


class AggressiveCleaner(ResidualCleaner):
    """More aggressive noise cleanup for very noisy audio."""

    def __init__(self):
        super().__init__(
            prop_decrease=0.95,
            stationary=False,
            n_fft=2048,
            hop_length=512,
        )


class GentleCleaner(ResidualCleaner):
    """Gentle noise cleanup to preserve voice quality."""

    def __init__(self):
        super().__init__(
            prop_decrease=0.6,
            stationary=False,
            n_fft=2048,
            hop_length=512,
        )
