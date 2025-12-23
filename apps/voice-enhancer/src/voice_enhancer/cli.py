"""Command-line interface for voice enhancement."""

import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from . import __version__
from .pipeline import create_pipeline, QualityPreset

console = Console()
error_console = Console(stderr=True)


def print_banner() -> None:
    """Print the application banner."""
    console.print(
        Panel.fit(
            "[bold cyan]Voice Enhancer[/bold cyan]\n"
            f"[dim]v{__version__}[/dim]\n\n"
            "Transform noisy audio into professional\n"
            "recording booth quality",
            border_style="cyan",
        )
    )


def print_settings(
    input_file: str,
    output_file: str,
    quality: str,
    target_lufs: float,
    skip_separation: bool,
    keep_intermediate: bool,
) -> None:
    """Print the current settings."""
    table = Table(title="Settings", show_header=False, border_style="dim")
    table.add_column("Setting", style="cyan")
    table.add_column("Value", style="white")

    table.add_row("Input", str(input_file))
    table.add_row("Output", str(output_file))
    table.add_row("Quality", quality)
    table.add_row("Target LUFS", f"{target_lufs} LUFS")
    table.add_row("Skip separation", "Yes" if skip_separation else "No")
    table.add_row("Keep intermediate", "Yes" if keep_intermediate else "No")

    console.print(table)
    console.print()


@click.command()
@click.argument("input_file", type=click.Path(exists=True, path_type=Path))
@click.option(
    "-o",
    "--output",
    "output_file",
    type=click.Path(path_type=Path),
    help="Output file path. If not specified, adds '_enhanced' suffix to input filename.",
)
@click.option(
    "-f",
    "--format",
    "output_format",
    type=click.Choice(["wav", "mp3"], case_sensitive=False),
    default=None,
    help="Output format. If not specified, inferred from output file extension or uses 'wav'.",
)
@click.option(
    "-q",
    "--quality",
    type=click.Choice(["fast", "balanced", "high"], case_sensitive=False),
    default="high",
    help="Quality preset. 'high' uses best models but is slower. Default: high",
)
@click.option(
    "--target-lufs",
    type=float,
    default=-16.0,
    help="Target loudness in LUFS. Default: -16 (podcast standard)",
)
@click.option(
    "--skip-separation",
    is_flag=True,
    default=False,
    help="Skip voice separation stage (use if input is already voice-only)",
)
@click.option(
    "--keep-intermediate",
    is_flag=True,
    default=False,
    help="Keep intermediate files from each processing stage",
)
@click.option(
    "-v",
    "--verbose",
    is_flag=True,
    default=False,
    help="Show detailed progress information",
)
@click.option(
    "--quiet",
    is_flag=True,
    default=False,
    help="Suppress all output except errors",
)
@click.version_option(version=__version__, prog_name="voice-enhancer")
def main(
    input_file: Path,
    output_file: Optional[Path],
    output_format: Optional[str],
    quality: str,
    target_lufs: float,
    skip_separation: bool,
    keep_intermediate: bool,
    verbose: bool,
    quiet: bool,
) -> None:
    """Enhance voice audio to professional recording booth quality.

    INPUT_FILE: Path to the input audio file (WAV or MP3)

    Examples:

        voice-enhancer recording.mp3

        voice-enhancer interview.wav -o clean_interview.wav

        voice-enhancer noisy.mp3 -q fast --skip-separation

        voice-enhancer podcast.wav --target-lufs -14 -f mp3
    """
    try:
        # Determine output file path
        if output_file is None:
            # Add '_enhanced' suffix to input filename
            suffix = f".{output_format}" if output_format else input_file.suffix
            output_file = input_file.parent / f"{input_file.stem}_enhanced{suffix}"

        # Determine output format
        if output_format is None:
            output_format = output_file.suffix.lower().lstrip(".")
            if output_format not in ("wav", "mp3"):
                output_format = "wav"

        # Print banner and settings
        if not quiet:
            print_banner()
            if verbose:
                print_settings(
                    str(input_file),
                    str(output_file),
                    quality,
                    target_lufs,
                    skip_separation,
                    keep_intermediate,
                )

        # Create and run pipeline
        pipeline = create_pipeline(
            quality=quality,
            target_lufs=target_lufs,
            skip_separation=skip_separation,
            keep_intermediate=keep_intermediate,
            output_format=output_format,
            verbose=verbose and not quiet,
        )

        if not quiet:
            console.print(f"[cyan]Processing:[/cyan] {input_file.name}")
            console.print(f"[cyan]Quality:[/cyan] {quality}")
            console.print()

        # Process the file
        output_path = pipeline.process(input_file, output_file)

        if not quiet:
            console.print()
            console.print(
                Panel.fit(
                    f"[green]Enhancement complete![/green]\n\n"
                    f"Output: [cyan]{output_path}[/cyan]",
                    border_style="green",
                )
            )

    except FileNotFoundError as e:
        error_console.print(f"[red]Error:[/red] {e}")
        sys.exit(1)
    except ValueError as e:
        error_console.print(f"[red]Error:[/red] {e}")
        sys.exit(1)
    except RuntimeError as e:
        error_console.print(f"[red]Error:[/red] {e}")
        error_console.print(
            "\n[yellow]Hint:[/yellow] Make sure ffmpeg is installed for MP3 support."
        )
        sys.exit(1)
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled by user[/yellow]")
        sys.exit(130)
    except Exception as e:
        error_console.print(f"[red]Unexpected error:[/red] {e}")
        if verbose:
            error_console.print_exception()
        sys.exit(1)


if __name__ == "__main__":
    main()
