"""Deep denoising stage using DeepFilterNet."""

from typing import Optional

import numpy as np
import torch
from rich.console import Console

from ..utils.audio import AudioData, resample_audio

console = Console()

# DeepFilterNet operates at 48kHz
DEEPFILTER_SAMPLE_RATE = 48000


class DeepDenoiser:
    """Deep learning-based noise removal using DeepFilterNet.

    DeepFilterNet is a state-of-the-art speech enhancement model that
    provides excellent noise removal while preserving voice quality.
    """

    def __init__(
        self,
        device: Optional[str] = None,
        enhance_mode: str = "full",
    ):
        """Initialize the deep denoiser.

        Args:
            device: Device to run on ('cuda', 'cpu', or None for auto-detect)
            enhance_mode: Enhancement mode:
                - "full": Full enhancement (denoise + perceptual enhancement)
                - "denoise": Denoise only (faster, less aggressive)
        """
        if device is None:
            if torch.cuda.is_available():
                self.device = "cuda"
            elif torch.backends.mps.is_available():
                self.device = "mps"
            else:
                self.device = "cpu"
        else:
            self.device = device
        self.enhance_mode = enhance_mode
        self._model = None
        self._df_state = None
        self._model_loaded = False

    def _load_model(self) -> None:
        """Load the DeepFilterNet model (lazy loading on first use)."""
        if self._model_loaded:
            return

        console.print("  Loading DeepFilterNet model...", style="dim")

        from df.enhance import enhance, init_df

        self._model, self._df_state, _ = init_df()
        self._model_loaded = True

        console.print(
            f"  DeepFilterNet loaded, mode: {self.enhance_mode}",
            style="dim",
        )

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Apply deep learning denoising to audio.

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Denoised AudioData
        """
        self._load_model()

        if verbose:
            console.print("  Applying deep denoising (DeepFilterNet)...", style="dim")

        # DeepFilterNet requires 48kHz audio
        original_sr = audio.sample_rate
        samples = audio.samples

        # Resample to 48kHz if needed
        if original_sr != DEEPFILTER_SAMPLE_RATE:
            if verbose:
                console.print(
                    f"  Resampling for DeepFilterNet: {original_sr}Hz -> {DEEPFILTER_SAMPLE_RATE}Hz",
                    style="dim",
                )
            samples = resample_audio(samples, original_sr, DEEPFILTER_SAMPLE_RATE)

        # DeepFilterNet expects (samples,) or (channels, samples)
        # Ensure samples is 1D for mono
        if samples.ndim > 1:
            samples = samples.flatten()

        # Convert to tensor - enhance() expects a Tensor of shape [C, T]
        from df.enhance import enhance

        # Convert numpy array to tensor with shape [1, samples] for mono
        audio_tensor = torch.from_numpy(samples).unsqueeze(0).float()
        
        # enhance() returns a tensor
        enhanced_tensor = enhance(self._model, self._df_state, audio_tensor)
        
        # Convert back to numpy
        enhanced = enhanced_tensor.squeeze(0).numpy()

        # Resample back to original sample rate if needed
        if original_sr != DEEPFILTER_SAMPLE_RATE:
            if verbose:
                console.print(
                    f"  Resampling back: {DEEPFILTER_SAMPLE_RATE}Hz -> {original_sr}Hz",
                    style="dim",
                )
            enhanced = resample_audio(enhanced, DEEPFILTER_SAMPLE_RATE, original_sr)

        if verbose:
            console.print("  Deep denoising complete", style="dim")

        return AudioData(
            samples=enhanced.astype(np.float32),
            sample_rate=original_sr,
            original_file=audio.original_file,
        )


class LightDenoiser:
    """Lighter denoising for 'fast' mode - skips deep learning denoising."""

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Pass through audio unchanged (no deep denoising).

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Same AudioData (deep denoising skipped)
        """
        if verbose:
            console.print("  Skipping deep denoising (fast mode)", style="dim")
        return audio.copy()
