"""Main pipeline orchestration for voice enhancement."""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional, Callable

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn

from .utils.audio import AudioData
from .stages.loader import AudioLoader
from .stages.separator import VoiceSeparator, FastVoiceSeparator
from .stages.denoiser import DeepDenoiser, LightDenoiser
from .stages.cleanup import ResidualCleaner, GentleCleaner
from .stages.dsp import DSPProcessor, MinimalDSP, SM7BSettings
from .stages.normalizer import LoudnessNormalizer

console = Console()


class QualityPreset(Enum):
    """Quality presets for voice enhancement."""

    FAST = "fast"
    BALANCED = "balanced"
    HIGH = "high"


@dataclass
class PipelineConfig:
    """Configuration for the voice enhancement pipeline."""

    quality: QualityPreset = QualityPreset.HIGH
    target_lufs: float = -16.0
    skip_separation: bool = False
    keep_intermediate: bool = False
    output_format: str = "wav"
    verbose: bool = False
    mic_style: str = "neutral"  # "neutral" or "sm7b"


class VoiceEnhancementPipeline:
    """Main pipeline for voice enhancement.

    Orchestrates all processing stages to transform noisy audio
    into professional "recording booth" quality.
    """

    def __init__(self, config: Optional[PipelineConfig] = None):
        """Initialize the pipeline with configuration.

        Args:
            config: Pipeline configuration (uses defaults if None)
        """
        self.config = config or PipelineConfig()
        self._setup_stages()

    def _setup_stages(self) -> None:
        """Set up processing stages based on quality preset."""
        quality = self.config.quality

        # Audio loader (same for all presets)
        self.loader = AudioLoader()

        # Voice separation
        if self.config.skip_separation or quality == QualityPreset.FAST:
            self.separator = FastVoiceSeparator()
        elif quality == QualityPreset.BALANCED:
            self.separator = VoiceSeparator(model_name="htdemucs")
        else:  # HIGH
            self.separator = VoiceSeparator(model_name="htdemucs_ft")

        # Deep denoising
        if quality == QualityPreset.FAST:
            self.denoiser = LightDenoiser()
        elif quality == QualityPreset.BALANCED:
            self.denoiser = DeepDenoiser(enhance_mode="denoise")
        else:  # HIGH
            self.denoiser = DeepDenoiser(enhance_mode="full")

        # Residual cleanup
        if quality == QualityPreset.FAST:
            self.cleaner = GentleCleaner()
        else:
            self.cleaner = ResidualCleaner(prop_decrease=0.8)

        # DSP processing
        if quality == QualityPreset.FAST:
            self.dsp = MinimalDSP()
        elif self.config.mic_style == "sm7b":
            self.dsp = DSPProcessor(eq=SM7BSettings())
        else:
            self.dsp = DSPProcessor()

        # Loudness normalization
        self.normalizer = LoudnessNormalizer(target_lufs=self.config.target_lufs)

    def process(
        self,
        input_path: str | Path,
        output_path: str | Path,
        progress_callback: Optional[Callable[[str, float], None]] = None,
    ) -> Path:
        """Process an audio file through the enhancement pipeline.

        Args:
            input_path: Path to input audio file (WAV or MP3)
            output_path: Path for output audio file
            progress_callback: Optional callback for progress updates (stage_name, progress)

        Returns:
            Path to the output file
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        verbose = self.config.verbose

        # Create output directory if needed
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Intermediate files directory
        intermediate_dir: Optional[Path] = None
        if self.config.keep_intermediate:
            intermediate_dir = output_path.parent / f"{output_path.stem}_intermediate"
            intermediate_dir.mkdir(parents=True, exist_ok=True)

        stages = [
            ("Loading", self._stage_load, input_path),
            ("Separating voice", self._stage_separate, None),
            ("Deep denoising", self._stage_denoise, None),
            ("Residual cleanup", self._stage_cleanup, None),
            ("DSP processing", self._stage_dsp, None),
            ("Normalizing", self._stage_normalize, None),
        ]

        audio = None

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            TimeElapsedColumn(),
            console=console,
            disable=not verbose,
        ) as progress:
            task = progress.add_task("Processing...", total=len(stages))

            for i, (stage_name, stage_fn, stage_arg) in enumerate(stages):
                progress.update(task, description=f"[cyan]{stage_name}...")

                if progress_callback:
                    progress_callback(stage_name, i / len(stages))

                # Run the stage
                if stage_arg is not None:
                    audio = stage_fn(stage_arg)
                else:
                    audio = stage_fn(audio)

                # Save intermediate if requested
                if self.config.keep_intermediate and audio is not None:
                    stage_num = i + 1
                    safe_name = stage_name.lower().replace(" ", "_")
                    intermediate_path = (
                        intermediate_dir / f"{stage_num:02d}_{safe_name}.wav"
                    )
                    self.loader.save(audio, intermediate_path, format="wav", verbose=False)
                    if verbose:
                        console.print(
                            f"  Saved intermediate: {intermediate_path.name}",
                            style="dim",
                        )

                progress.advance(task)

        # Save final output
        if verbose:
            console.print(f"\n[green]Saving output: {output_path}")

        self.loader.save(
            audio, output_path, format=self.config.output_format, verbose=verbose
        )

        if progress_callback:
            progress_callback("Complete", 1.0)

        return output_path

    def _stage_load(self, input_path: Path) -> AudioData:
        """Load audio file."""
        return self.loader.load(input_path, verbose=self.config.verbose)

    def _stage_separate(self, audio: AudioData) -> AudioData:
        """Separate voice from background."""
        return self.separator.process(audio, verbose=self.config.verbose)

    def _stage_denoise(self, audio: AudioData) -> AudioData:
        """Apply deep denoising."""
        return self.denoiser.process(audio, verbose=self.config.verbose)

    def _stage_cleanup(self, audio: AudioData) -> AudioData:
        """Apply residual noise cleanup."""
        return self.cleaner.process(audio, verbose=self.config.verbose)

    def _stage_dsp(self, audio: AudioData) -> AudioData:
        """Apply DSP processing."""
        return self.dsp.process(audio, verbose=self.config.verbose)

    def _stage_normalize(self, audio: AudioData) -> AudioData:
        """Apply loudness normalization."""
        return self.normalizer.process(audio, verbose=self.config.verbose)


def create_pipeline(
    quality: str = "high",
    target_lufs: float = -16.0,
    skip_separation: bool = False,
    keep_intermediate: bool = False,
    output_format: str = "wav",
    verbose: bool = False,
    mic_style: str = "neutral",
) -> VoiceEnhancementPipeline:
    """Create a voice enhancement pipeline with the given settings.

    Args:
        quality: Quality preset ('fast', 'balanced', 'high')
        target_lufs: Target loudness in LUFS
        skip_separation: Whether to skip voice separation
        keep_intermediate: Whether to keep intermediate files
        output_format: Output format ('wav' or 'mp3')
        verbose: Whether to print detailed progress
        mic_style: Microphone style emulation ('neutral' or 'sm7b')

    Returns:
        Configured VoiceEnhancementPipeline
    """
    # Parse quality preset
    quality_map = {
        "fast": QualityPreset.FAST,
        "balanced": QualityPreset.BALANCED,
        "high": QualityPreset.HIGH,
    }
    quality_preset = quality_map.get(quality.lower(), QualityPreset.HIGH)

    config = PipelineConfig(
        quality=quality_preset,
        target_lufs=target_lufs,
        skip_separation=skip_separation,
        keep_intermediate=keep_intermediate,
        output_format=output_format,
        verbose=verbose,
        mic_style=mic_style,
    )

    return VoiceEnhancementPipeline(config)
