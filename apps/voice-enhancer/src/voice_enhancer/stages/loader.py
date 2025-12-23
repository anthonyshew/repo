"""Audio loading stage - handles WAV and MP3 input."""

from pathlib import Path
from typing import Optional

import numpy as np
import soundfile as sf
from pydub import AudioSegment
from rich.console import Console

from ..utils.audio import AudioData, convert_to_mono, resample_audio

console = Console()

# Target sample rate for processing (44.1kHz is standard for high-quality audio)
TARGET_SAMPLE_RATE = 44100


class AudioLoader:
    """Load audio files and prepare them for processing."""

    def __init__(self, target_sr: int = TARGET_SAMPLE_RATE):
        """Initialize the audio loader.

        Args:
            target_sr: Target sample rate for output audio
        """
        self.target_sr = target_sr

    def load(self, file_path: str | Path, verbose: bool = False) -> AudioData:
        """Load an audio file and prepare it for processing.

        Args:
            file_path: Path to the audio file (WAV or MP3)
            verbose: Whether to print detailed information

        Returns:
            AudioData object with normalized mono audio at target sample rate

        Raises:
            ValueError: If the file format is not supported
            FileNotFoundError: If the file does not exist
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        suffix = file_path.suffix.lower()

        if suffix == ".wav":
            audio_data = self._load_wav(file_path, verbose)
        elif suffix == ".mp3":
            audio_data = self._load_mp3(file_path, verbose)
        else:
            raise ValueError(
                f"Unsupported audio format: {suffix}. Supported formats: .wav, .mp3"
            )

        # Convert to mono if needed
        if audio_data.samples.ndim > 1 or (
            audio_data.samples.ndim == 1 and len(audio_data.samples.shape) > 1
        ):
            if verbose:
                console.print("  Converting to mono...", style="dim")
            audio_data.samples = convert_to_mono(audio_data.samples)

        # Resample if needed
        if audio_data.sample_rate != self.target_sr:
            if verbose:
                console.print(
                    f"  Resampling from {audio_data.sample_rate}Hz to {self.target_sr}Hz...",
                    style="dim",
                )
            audio_data.samples = resample_audio(
                audio_data.samples, audio_data.sample_rate, self.target_sr
            )
            audio_data.sample_rate = self.target_sr

        if verbose:
            console.print(
                f"  Loaded: {audio_data.duration:.2f}s, {audio_data.sample_rate}Hz, "
                f"{audio_data.num_samples:,} samples",
                style="dim",
            )

        return audio_data

    def _load_wav(self, file_path: Path, verbose: bool = False) -> AudioData:
        """Load a WAV file using soundfile.

        Args:
            file_path: Path to the WAV file
            verbose: Whether to print detailed information

        Returns:
            AudioData object
        """
        if verbose:
            console.print(f"  Loading WAV file: {file_path.name}", style="dim")

        # soundfile returns (samples, channels) for stereo, (samples,) for mono
        samples, sample_rate = sf.read(file_path, dtype="float32")

        # Transpose if stereo to get (channels, samples) format
        if samples.ndim == 2:
            samples = samples.T

        return AudioData(
            samples=samples.astype(np.float32),
            sample_rate=sample_rate,
            original_file=str(file_path),
        )

    def _load_mp3(self, file_path: Path, verbose: bool = False) -> AudioData:
        """Load an MP3 file using pydub (requires ffmpeg).

        Args:
            file_path: Path to the MP3 file
            verbose: Whether to print detailed information

        Returns:
            AudioData object
        """
        if verbose:
            console.print(f"  Loading MP3 file: {file_path.name}", style="dim")

        try:
            audio_segment = AudioSegment.from_mp3(file_path)
        except Exception as e:
            raise RuntimeError(
                f"Failed to load MP3 file. Make sure ffmpeg is installed. Error: {e}"
            ) from e

        # Get sample rate and convert to numpy array
        sample_rate = audio_segment.frame_rate
        channels = audio_segment.channels

        # Convert to numpy array
        samples = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)

        # Normalize to [-1, 1] range (pydub uses int16)
        samples = samples / 32768.0

        # Reshape if stereo
        if channels == 2:
            samples = samples.reshape((-1, 2)).T

        return AudioData(
            samples=samples.astype(np.float32),
            sample_rate=sample_rate,
            original_file=str(file_path),
        )

    def save(
        self,
        audio: AudioData,
        file_path: str | Path,
        format: Optional[str] = None,
        verbose: bool = False,
    ) -> None:
        """Save audio to a file.

        Args:
            audio: AudioData to save
            file_path: Output file path
            format: Output format ('wav' or 'mp3'). If None, inferred from extension.
            verbose: Whether to print detailed information
        """
        file_path = Path(file_path)

        if format is None:
            format = file_path.suffix.lower().lstrip(".")

        if format == "wav":
            self._save_wav(audio, file_path, verbose)
        elif format == "mp3":
            self._save_mp3(audio, file_path, verbose)
        else:
            raise ValueError(f"Unsupported output format: {format}")

    def _save_wav(
        self, audio: AudioData, file_path: Path, verbose: bool = False
    ) -> None:
        """Save audio as WAV file.

        Args:
            audio: AudioData to save
            file_path: Output file path
            verbose: Whether to print detailed information
        """
        if verbose:
            console.print(f"  Saving WAV file: {file_path.name}", style="dim")

        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        sf.write(file_path, audio.samples, audio.sample_rate)

    def _save_mp3(
        self, audio: AudioData, file_path: Path, verbose: bool = False
    ) -> None:
        """Save audio as MP3 file using pydub.

        Args:
            audio: AudioData to save
            file_path: Output file path
            verbose: Whether to print detailed information
        """
        if verbose:
            console.print(f"  Saving MP3 file: {file_path.name}", style="dim")

        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Convert to int16 for pydub
        samples_int16 = (audio.samples * 32767).astype(np.int16)

        # Create AudioSegment
        audio_segment = AudioSegment(
            samples_int16.tobytes(),
            frame_rate=audio.sample_rate,
            sample_width=2,  # 16-bit
            channels=1,  # mono
        )

        # Export as MP3 with high quality
        audio_segment.export(file_path, format="mp3", bitrate="320k")
