"""Voice separation stage using Demucs."""

import os
import tempfile
from pathlib import Path
from typing import Optional

import numpy as np
import torch

# Use all available CPU cores for PyTorch operations
torch.set_num_threads(os.cpu_count() or 4)
from rich.console import Console
from rich.progress import (
    Progress,
    BarColumn,
    TextColumn,
    TimeRemainingColumn,
    TaskProgressColumn,
)
from tqdm import tqdm

from ..utils.audio import AudioData

console = Console()


class _RichProgressBar(tqdm):
    """A tqdm-compatible progress bar that uses Rich for display."""

    def __init__(self, *args, **kwargs):
        # Remove tqdm-specific args that Rich doesn't need
        kwargs.pop("unit", None)
        kwargs.pop("unit_scale", None)
        kwargs.pop("ncols", None)
        kwargs.pop("leave", None)

        self.total = kwargs.get("total", None)
        self._progress = Progress(
            TextColumn("  [cyan]Separating voice..."),
            BarColumn(),
            TaskProgressColumn(),
            TimeRemainingColumn(),
            console=console,
        )
        self._progress.start()
        self._task = self._progress.add_task("", total=self.total)
        self._n = 0

    def update(self, n=1):
        self._n += n
        self._progress.update(self._task, completed=self._n)

    def close(self):
        self._progress.stop()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class VoiceSeparator:
    """Separate voice from background using Demucs ML model."""

    def __init__(self, model_name: str = "htdemucs_ft", device: Optional[str] = None):
        """Initialize the voice separator.

        Args:
            model_name: Demucs model to use:
                - "htdemucs": Fast hybrid transformer model
                - "htdemucs_ft": Fine-tuned version (best quality, slower)
            device: Device to run on ('cuda', 'cpu', or None for auto-detect)
        """
        self.model_name = model_name
        device_str = device
        if device_str is None:
            if torch.cuda.is_available():
                device_str = "cuda"
            elif torch.backends.mps.is_available():
                device_str = "mps"
            else:
                device_str = "cpu"
        self.device = torch.device(device_str)
        self._model = None
        self._model_loaded = False

    def _load_model(self) -> None:
        """Load the Demucs model (lazy loading on first use)."""
        if self._model_loaded:
            return

        console.print(f"  Loading Demucs model: {self.model_name}...", style="dim")

        from demucs.pretrained import get_model
        from demucs.apply import BagOfModels

        self._model = get_model(self.model_name)

        if isinstance(self._model, BagOfModels):
            # For bag of models, check first model's sample rate
            self._model_sr = self._model.models[0].samplerate
        else:
            self._model_sr = self._model.samplerate

        self._model.to(self.device)
        self._model.eval()
        self._model_loaded = True

        console.print(
            f"  Model loaded on {str(self.device).upper()}, sample rate: {self._model_sr}Hz",
            style="dim",
        )

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Separate voice from background noise/music.

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            AudioData containing only the isolated voice
        """
        self._load_model()

        # Convert to tensor and ensure correct format for Demucs
        # Demucs expects (batch, channels, samples) at model's sample rate
        samples = audio.samples

        # Ensure 2D: (channels, samples)
        if samples.ndim == 1:
            samples = samples[np.newaxis, :]

        # Demucs expects stereo input, so duplicate mono to stereo
        if samples.shape[0] == 1:
            samples = np.vstack([samples, samples])

        # Resample to model's sample rate if needed
        if audio.sample_rate != self._model_sr:
            from ..utils.audio import resample_audio

            if verbose:
                console.print(
                    f"  Resampling for Demucs: {audio.sample_rate}Hz -> {self._model_sr}Hz",
                    style="dim",
                )
            samples_left = resample_audio(samples[0], audio.sample_rate, self._model_sr)
            samples_right = resample_audio(
                samples[1], audio.sample_rate, self._model_sr
            )
            samples = np.vstack([samples_left, samples_right])

        # Convert to tensor: (batch, channels, samples)
        tensor = torch.from_numpy(samples).float().unsqueeze(0).to(self.device)

        # Run separation
        with torch.no_grad():
            from demucs.apply import apply_model

            # apply_model returns (batch, sources, channels, samples)
            # Use our Rich-based progress bar for better terminal display
            # Use multiple workers to parallelize chunk processing
            sources = apply_model(
                self._model,
                tensor,
                device=self.device,
                progress=_RichProgressBar,
                num_workers=os.cpu_count() or 4,
            )

        # Extract vocals (index depends on model, but vocals is typically index 3 for htdemucs)
        # htdemucs sources: drums, bass, other, vocals
        vocals_idx = 3
        vocals = sources[0, vocals_idx]  # (channels, samples)

        # Convert back to mono
        vocals_mono = vocals.mean(dim=0).cpu().numpy()

        # Resample back to original sample rate if needed
        if audio.sample_rate != self._model_sr:
            from ..utils.audio import resample_audio

            if verbose:
                console.print(
                    f"  Resampling back: {self._model_sr}Hz -> {audio.sample_rate}Hz",
                    style="dim",
                )
            vocals_mono = resample_audio(vocals_mono, self._model_sr, audio.sample_rate)

        if verbose:
            console.print("  Voice separation complete", style="dim")

        return AudioData(
            samples=vocals_mono.astype(np.float32),
            sample_rate=audio.sample_rate,
            original_file=audio.original_file,
        )


class FastVoiceSeparator:
    """A faster but lower quality voice separator that skips ML separation.

    Used for the 'fast' quality preset when audio is already mostly voice.
    """

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Pass through audio unchanged (no separation).

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Same AudioData (voice separation skipped)
        """
        if verbose:
            console.print(
                "  Skipping voice separation (fast mode or --skip-separation)",
                style="dim",
            )
        return audio.copy()
