"""DSP processing stage - EQ, compression, and limiting."""

from dataclasses import dataclass
from typing import Optional

import numpy as np
from scipy import signal
from rich.console import Console

from ..utils.audio import AudioData

console = Console()


@dataclass
class EQSettings:
    """Equalizer settings for voice enhancement."""

    # High-pass filter (remove rumble)
    highpass_freq: float = 80.0
    highpass_order: int = 4

    # Low-mid cut (reduce muddiness)
    mud_freq: float = 250.0
    mud_gain_db: float = -2.0
    mud_q: float = 2.0

    # Presence boost (clarity)
    presence_freq: float = 3000.0
    presence_gain_db: float = 2.0
    presence_q: float = 1.5

    # Air boost (brightness) - high shelf
    air_freq: float = 10000.0
    air_gain_db: float = 1.5

    # Low shelf for warmth (SM7B-style)
    warmth_freq: float = 150.0
    warmth_gain_db: float = 0.0  # Disabled by default


class SM7BSettings(EQSettings):
    """EQ settings that emulate the Shure SM7B microphone character.
    
    The SM7B is known for:
    - Warm, smooth low-mids
    - Reduced proximity effect (less boomy)
    - Smooth presence without harshness
    - Gentle high-end rolloff (no sibilance)
    """
    
    def __init__(self):
        super().__init__(
            # SM7B has a gentle high-pass, less aggressive than condensers
            highpass_freq=60.0,
            highpass_order=2,
            
            # Cut the "boxy" frequencies more aggressively
            mud_freq=350.0,
            mud_gain_db=-3.0,
            mud_q=1.5,
            
            # SM7B presence is smooth, centered around 4-5kHz
            presence_freq=4500.0,
            presence_gain_db=2.5,
            presence_q=1.0,
            
            # SM7B rolls off highs gently - less "air" than condensers
            air_freq=12000.0,
            air_gain_db=-1.5,  # Slight cut for smoothness
            
            # Add warmth in the low-mids (SM7B signature)
            warmth_freq=120.0,
            warmth_gain_db=2.0,
        )


@dataclass
class CompressorSettings:
    """Compressor settings for voice enhancement."""

    threshold_db: float = -18.0
    ratio: float = 3.0
    attack_ms: float = 10.0
    release_ms: float = 100.0
    knee_db: float = 6.0
    makeup_gain_db: float = 0.0  # Auto-calculated if 0


@dataclass
class LimiterSettings:
    """Limiter settings for preventing clipping."""

    threshold_db: float = -1.0
    release_ms: float = 50.0


class DSPProcessor:
    """Digital signal processing for voice enhancement.

    Applies professional EQ, compression, and limiting to make
    voice audio sound polished and broadcast-ready.
    """

    def __init__(
        self,
        eq: Optional[EQSettings] = None,
        compressor: Optional[CompressorSettings] = None,
        limiter: Optional[LimiterSettings] = None,
    ):
        """Initialize DSP processor with settings.

        Args:
            eq: EQ settings (uses defaults if None)
            compressor: Compressor settings (uses defaults if None)
            limiter: Limiter settings (uses defaults if None)
        """
        self.eq = eq or EQSettings()
        self.compressor = compressor or CompressorSettings()
        self.limiter = limiter or LimiterSettings()

    def process(self, audio: AudioData, verbose: bool = False) -> AudioData:
        """Apply DSP processing chain to audio.

        Args:
            audio: Input AudioData
            verbose: Whether to print detailed information

        Returns:
            Processed AudioData
        """
        if verbose:
            console.print("  Applying DSP processing...", style="dim")

        samples = audio.samples.copy()
        sr = audio.sample_rate

        # Apply EQ
        samples = self._apply_eq(samples, sr, verbose)

        # Apply compression
        samples = self._apply_compression(samples, sr, verbose)

        # Apply limiting
        samples = self._apply_limiting(samples, sr, verbose)

        if verbose:
            console.print("  DSP processing complete", style="dim")

        return AudioData(
            samples=samples.astype(np.float32),
            sample_rate=sr,
            original_file=audio.original_file,
        )

    def _apply_eq(
        self, samples: np.ndarray, sr: int, verbose: bool = False
    ) -> np.ndarray:
        """Apply equalization to audio.

        Args:
            samples: Audio samples
            sr: Sample rate
            verbose: Whether to print detailed information

        Returns:
            EQ'd audio samples
        """
        if verbose:
            console.print("    Applying EQ...", style="dim")

        # High-pass filter (remove rumble)
        nyquist = sr / 2
        hp_normalized = self.eq.highpass_freq / nyquist
        if hp_normalized < 1.0:
            b, a = signal.butter(self.eq.highpass_order, hp_normalized, btype="high")
            samples = signal.filtfilt(b, a, samples)

        # Parametric EQ using biquad filters

        # Mud cut (peaking filter with negative gain)
        samples = self._apply_peaking_eq(
            samples,
            sr,
            self.eq.mud_freq,
            self.eq.mud_gain_db,
            self.eq.mud_q,
        )

        # Presence boost
        samples = self._apply_peaking_eq(
            samples,
            sr,
            self.eq.presence_freq,
            self.eq.presence_gain_db,
            self.eq.presence_q,
        )

        # Air boost (high shelf)
        samples = self._apply_high_shelf(
            samples,
            sr,
            self.eq.air_freq,
            self.eq.air_gain_db,
        )

        # Warmth boost (low shelf) - for SM7B-style sound
        if hasattr(self.eq, 'warmth_gain_db') and abs(self.eq.warmth_gain_db) > 0.1:
            samples = self._apply_low_shelf(
                samples,
                sr,
                self.eq.warmth_freq,
                self.eq.warmth_gain_db,
            )

        return samples

    def _apply_peaking_eq(
        self,
        samples: np.ndarray,
        sr: int,
        freq: float,
        gain_db: float,
        q: float,
    ) -> np.ndarray:
        """Apply a peaking EQ filter.

        Args:
            samples: Audio samples
            sr: Sample rate
            freq: Center frequency
            gain_db: Gain in dB
            q: Q factor (bandwidth)

        Returns:
            Filtered audio samples
        """
        if abs(gain_db) < 0.1:
            return samples

        A = 10 ** (gain_db / 40)
        w0 = 2 * np.pi * freq / sr
        alpha = np.sin(w0) / (2 * q)

        b0 = 1 + alpha * A
        b1 = -2 * np.cos(w0)
        b2 = 1 - alpha * A
        a0 = 1 + alpha / A
        a1 = -2 * np.cos(w0)
        a2 = 1 - alpha / A

        b = np.array([b0 / a0, b1 / a0, b2 / a0])
        a = np.array([1.0, a1 / a0, a2 / a0])

        return signal.filtfilt(b, a, samples)

    def _apply_high_shelf(
        self,
        samples: np.ndarray,
        sr: int,
        freq: float,
        gain_db: float,
    ) -> np.ndarray:
        """Apply a high shelf filter.

        Args:
            samples: Audio samples
            sr: Sample rate
            freq: Shelf frequency
            gain_db: Gain in dB

        Returns:
            Filtered audio samples
        """
        if abs(gain_db) < 0.1:
            return samples

        A = 10 ** (gain_db / 40)
        w0 = 2 * np.pi * freq / sr
        alpha = np.sin(w0) / 2 * np.sqrt(2)

        cos_w0 = np.cos(w0)
        sqrt_A = np.sqrt(A)
        alpha_sqrt_A = 2 * sqrt_A * alpha

        b0 = A * ((A + 1) + (A - 1) * cos_w0 + alpha_sqrt_A)
        b1 = -2 * A * ((A - 1) + (A + 1) * cos_w0)
        b2 = A * ((A + 1) + (A - 1) * cos_w0 - alpha_sqrt_A)
        a0 = (A + 1) - (A - 1) * cos_w0 + alpha_sqrt_A
        a1 = 2 * ((A - 1) - (A + 1) * cos_w0)
        a2 = (A + 1) - (A - 1) * cos_w0 - alpha_sqrt_A

        b = np.array([b0 / a0, b1 / a0, b2 / a0])
        a = np.array([1.0, a1 / a0, a2 / a0])

        return signal.filtfilt(b, a, samples)

    def _apply_low_shelf(
        self,
        samples: np.ndarray,
        sr: int,
        freq: float,
        gain_db: float,
    ) -> np.ndarray:
        """Apply a low shelf filter.

        Args:
            samples: Audio samples
            sr: Sample rate
            freq: Shelf frequency
            gain_db: Gain in dB

        Returns:
            Filtered audio samples
        """
        if abs(gain_db) < 0.1:
            return samples

        A = 10 ** (gain_db / 40)
        w0 = 2 * np.pi * freq / sr
        alpha = np.sin(w0) / 2 * np.sqrt(2)

        cos_w0 = np.cos(w0)
        sqrt_A = np.sqrt(A)
        alpha_sqrt_A = 2 * sqrt_A * alpha

        b0 = A * ((A + 1) - (A - 1) * cos_w0 + alpha_sqrt_A)
        b1 = 2 * A * ((A - 1) - (A + 1) * cos_w0)
        b2 = A * ((A + 1) - (A - 1) * cos_w0 - alpha_sqrt_A)
        a0 = (A + 1) + (A - 1) * cos_w0 + alpha_sqrt_A
        a1 = -2 * ((A - 1) + (A + 1) * cos_w0)
        a2 = (A + 1) + (A - 1) * cos_w0 - alpha_sqrt_A

        b = np.array([b0 / a0, b1 / a0, b2 / a0])
        a = np.array([1.0, a1 / a0, a2 / a0])

        return signal.filtfilt(b, a, samples)

    def _apply_compression(
        self, samples: np.ndarray, sr: int, verbose: bool = False
    ) -> np.ndarray:
        """Apply dynamic range compression.

        Args:
            samples: Audio samples
            sr: Sample rate
            verbose: Whether to print detailed information

        Returns:
            Compressed audio samples
        """
        if verbose:
            console.print(
                f"    Applying compression (ratio: {self.compressor.ratio}:1, "
                f"threshold: {self.compressor.threshold_db}dB)...",
                style="dim",
            )

        # Convert settings to linear scale
        threshold = 10 ** (self.compressor.threshold_db / 20)
        ratio = self.compressor.ratio

        # Calculate attack and release coefficients
        attack_samples = int(self.compressor.attack_ms * sr / 1000)
        release_samples = int(self.compressor.release_ms * sr / 1000)

        attack_coef = np.exp(-1.0 / max(attack_samples, 1))
        release_coef = np.exp(-1.0 / max(release_samples, 1))

        # Vectorized envelope follower using scipy
        # Get absolute values for envelope detection
        abs_samples = np.abs(samples)

        # Use a simple IIR filter to approximate the envelope
        # This is much faster than sample-by-sample processing
        from scipy.signal import lfilter

        # Attack envelope (fast rise)
        attack_b = [1 - attack_coef]
        attack_a = [1, -attack_coef]

        # Release envelope (slow fall)
        release_b = [1 - release_coef]
        release_a = [1, -release_coef]

        # Compute attack and release envelopes
        attack_env = lfilter(attack_b, attack_a, abs_samples)
        release_env = lfilter(release_b, release_a, abs_samples)

        # Combine: use max of attack (for fast peaks) and release (for slow decay)
        # This approximates the sample-by-sample conditional logic
        envelope = np.maximum(attack_env, release_env)

        # Smooth the envelope with another low-pass filter
        smooth_coef = release_coef
        smooth_b = [1 - smooth_coef]
        smooth_a = [1, -smooth_coef]
        envelope = lfilter(smooth_b, smooth_a, envelope)

        # Vectorized gain reduction calculation
        gain_reduction = np.ones_like(samples)
        over_threshold_mask = envelope > threshold

        # Apply compression only where envelope exceeds threshold
        over_threshold = envelope[over_threshold_mask] / threshold
        gain_reduction[over_threshold_mask] = 1.0 / (
            1.0 + (over_threshold - 1.0) * (ratio - 1.0) / ratio
        )

        # Apply gain reduction
        output = samples * gain_reduction

        # Apply makeup gain
        if self.compressor.makeup_gain_db == 0:
            # Auto makeup gain: compensate for average gain reduction
            peak_in = np.max(np.abs(samples))
            peak_out = np.max(np.abs(output))
            if peak_out > 0:
                makeup = peak_in / peak_out * 0.9  # Leave some headroom
                output *= makeup
        else:
            makeup = 10 ** (self.compressor.makeup_gain_db / 20)
            output *= makeup

        return output

    def _apply_limiting(
        self, samples: np.ndarray, sr: int, verbose: bool = False
    ) -> np.ndarray:
        """Apply brick-wall limiting to prevent clipping.

        Args:
            samples: Audio samples
            sr: Sample rate
            verbose: Whether to print detailed information

        Returns:
            Limited audio samples
        """
        if verbose:
            console.print(
                f"    Applying limiter (ceiling: {self.limiter.threshold_db}dB)...",
                style="dim",
            )

        threshold = 10 ** (self.limiter.threshold_db / 20)

        # Simple soft clipping / limiting
        output = np.tanh(samples / threshold) * threshold

        return output


class MinimalDSP(DSPProcessor):
    """Minimal DSP for fast mode - just basic high-pass and limiting."""

    def __init__(self):
        super().__init__(
            eq=EQSettings(
                highpass_freq=80.0,
                mud_gain_db=0.0,  # Skip
                presence_gain_db=0.0,  # Skip
                air_gain_db=0.0,  # Skip
            ),
            compressor=None,
            limiter=LimiterSettings(threshold_db=-1.0),
        )

    def _apply_compression(
        self, samples: np.ndarray, sr: int, verbose: bool = False
    ) -> np.ndarray:
        """Skip compression in minimal mode."""
        if verbose:
            console.print("    Skipping compression (fast mode)", style="dim")
        return samples
