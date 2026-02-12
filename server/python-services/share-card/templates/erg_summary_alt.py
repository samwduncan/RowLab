"""
Erg Summary Card - Design B (Fresh Direction)
Editorial/artistic approach with full-bleed gradients and dynamic asymmetric layout.
Handles all C2 workout types: JustRow, intervals, timed splits, etc.
"""

import math
from datetime import datetime
from templates.base_template import (
    setup_canvas, draw_text, draw_gradient_rect,
    draw_rounded_rect, draw_grain_texture, draw_rowlab_branding,
    surface_to_png_bytes, hex_to_rgb,
    DARK_BG, GOLD, ROSE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED
)

DIMENSIONS = {
    '1:1': (2160, 2160),
    '9:16': (2160, 3840),
}

# Workout type display names
WORKOUT_TYPE_LABELS = {
    'JustRow': 'Free Row',
    'FixedDistanceSplits': 'Fixed Distance',
    'FixedTimeSplits': 'Fixed Time',
    'FixedCalorie': 'Calorie Target',
    'FixedTimeInterval': 'Time Intervals',
    'FixedDistanceInterval': 'Distance Intervals',
    'VariableInterval': 'Variable Intervals',
    'VariableIntervalUndefinedRest': 'Variable Intervals',
}

# Machine type display names
MACHINE_LABELS = {
    'rower': 'ERG',
    'slides': 'DYNAMIC',
    'dynamic': 'DYNAMIC',
    'skierg': 'SKIERG',
    'bike': 'BIKEERG',
    'bikerg': 'BIKEERG',
}


def safe_str(value, fallback='--'):
    """Safely convert value to string, handling None/missing"""
    if value is None:
        return fallback
    return str(value)


def format_time(seconds):
    """Format seconds to MM:SS.d or H:MM:SS.d"""
    if not seconds:
        return '--:--'
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = seconds % 60
    if hrs > 0:
        return f"{hrs}:{mins:02d}:{secs:04.1f}"
    return f"{mins}:{secs:04.1f}"


def format_pace_tenths(tenths):
    """Format tenths-of-seconds-per-500m to M:SS.d"""
    if not tenths:
        return '--:--'
    total_seconds = tenths / 10
    mins = int(total_seconds // 60)
    secs = total_seconds % 60
    return f"{mins}:{secs:04.1f}"


def format_date(iso_date):
    """Format ISO date string to readable format"""
    try:
        dt = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
        return dt.strftime('%b %d, %Y')
    except (ValueError, AttributeError):
        return iso_date or ''


def build_title(data):
    """Build a display title from workout data"""
    workout_type = data.get('workoutType', '')
    machine = data.get('rawMachineType') or data.get('machineType') or 'rower'
    machine_label = MACHINE_LABELS.get(machine, 'ERG')
    type_label = WORKOUT_TYPE_LABELS.get(workout_type, 'Workout')

    distance = data.get('distanceM')
    if distance and distance >= 1000:
        return f"{distance / 1000:.0f}K {machine_label} {type_label}"
    elif distance:
        return f"{distance}m {machine_label} {type_label}"
    return f"{machine_label} {type_label}"


def is_interval_workout(data):
    """Check if this is an interval-type workout"""
    wtype = (data.get('workoutType') or '').lower()
    return 'interval' in wtype


def draw_wave_pattern(ctx, width, height, color, opacity=0.08):
    """Draw abstract water-inspired wave curves"""
    import cairocffi as cairo

    ctx.save()
    ctx.set_source_rgba(*color, opacity)
    ctx.set_line_width(3)

    wave_count = 5
    for i in range(wave_count):
        y_base = height * 0.2 + (i * height * 0.15)
        amplitude = 80 + (i * 20)
        frequency = 0.003 + (i * 0.0005)

        ctx.move_to(0, y_base)
        for x in range(0, width, 10):
            y = y_base + math.sin(x * frequency) * amplitude
            ctx.line_to(x, y)

        ctx.stroke()

    ctx.restore()


def render_erg_summary_alt(format_key, workout_data, options):
    """
    Design B: Fresh Direction - Editorial/artistic approach.
    Handles real C2 data with nullable fields and variable split counts.
    """
    width, height = DIMENSIONS[format_key]
    is_story = format_key == '9:16'

    surface, ctx = setup_canvas(width, height)

    # --- FULL-BLEED GRADIENT BACKGROUND ---
    import cairocffi as cairo
    gradient = cairo.LinearGradient(0, 0, width, height)
    gradient.add_color_stop_rgb(0, 0.03, 0.03, 0.04)
    gradient.add_color_stop_rgb(0.5, 0.08, 0.06, 0.08)
    gradient.add_color_stop_rgb(1, 0.12, 0.08, 0.06)

    ctx.set_source(gradient)
    ctx.rectangle(0, 0, width, height)
    ctx.fill()

    # --- ABSTRACT WAVE PATTERN ---
    draw_wave_pattern(ctx, width, height, GOLD, opacity=0.06)

    # --- Extract formatted values (use pre-formatted or compute) ---
    formatted = workout_data.get('formatted', {})
    total_time = formatted.get('totalTime') or format_time(workout_data.get('durationSeconds'))
    avg_pace = formatted.get('avgPace') or format_pace_tenths(workout_data.get('avgPaceTenths'))
    avg_watts = workout_data.get('avgWatts')
    avg_hr = workout_data.get('avgHeartRate')
    stroke_rate = workout_data.get('strokeRate')
    distance_m = workout_data.get('distanceM')
    calories = workout_data.get('calories')
    drag_factor = workout_data.get('dragFactor')
    splits = workout_data.get('splits', [])
    is_intervals = is_interval_workout(workout_data)

    # --- WORKOUT TITLE (offset left for asymmetry) ---
    title_x = 120
    title_y = 140

    title = build_title(workout_data)
    draw_text(
        ctx, title, "IBM Plex Sans", 72,
        title_x, title_y, TEXT_PRIMARY, weight='Bold', align='left'
    )

    # Date below title
    date_str = format_date(workout_data.get('date', ''))
    date_y = title_y + 100
    draw_text(
        ctx, date_str, "IBM Plex Sans", 28,
        title_x, date_y, TEXT_MUTED, weight='Regular', align='left'
    )

    # --- HERO METRIC (dramatic size contrast) ---
    hero_y = 400

    # Choose hero metric based on workout type
    if distance_m and distance_m in (2000, 6000, 500, 1000):
        # Standard test distances — show total time as hero
        hero_value = total_time or '--:--'
        hero_label = "TOTAL TIME"
    elif is_intervals:
        # Interval workouts — show avg pace as hero
        hero_value = avg_pace or '--:--'
        hero_label = "AVG SPLIT"
    else:
        # General workouts — show avg pace
        hero_value = avg_pace or '--:--'
        hero_label = "AVG PACE"

    draw_text(
        ctx, hero_value, "IBM Plex Mono", 200,
        width / 2, hero_y, TEXT_PRIMARY, weight='Bold', align='center'
    )

    label_y = hero_y + 240
    draw_text(
        ctx, hero_label, "IBM Plex Sans", 32,
        width / 2, label_y, ROSE, weight='Bold', align='center'
    )

    # --- SECONDARY METRICS (asymmetric arrangement) ---
    metrics_y = label_y + 140

    # Build metrics dynamically based on available data
    left_metrics = []
    right_metrics = []

    if avg_watts is not None:
        left_metrics.append((str(avg_watts), "WATTS"))
    if stroke_rate is not None:
        left_metrics.append((str(stroke_rate), "STROKES/MIN"))
    if calories is not None and not left_metrics:
        left_metrics.append((str(calories), "CALORIES"))

    if avg_hr is not None:
        right_metrics.append((str(avg_hr), "AVG HR"))
    if distance_m is not None:
        right_metrics.append((f"{distance_m:,}m", "DISTANCE"))
    if drag_factor is not None and len(right_metrics) < 2:
        right_metrics.append((str(drag_factor), "DRAG FACTOR"))

    # If watts not available (bike), show total time and calories instead
    if not left_metrics:
        left_metrics.append((total_time or '--:--', "TOTAL TIME"))
        if calories is not None:
            left_metrics.append((str(calories), "CALORIES"))

    # Left column
    left_x = 240
    y_offset = metrics_y
    for value, label in left_metrics:
        draw_text(
            ctx, value, "IBM Plex Mono", 72,
            left_x, y_offset, GOLD, weight='Bold', align='left'
        )
        draw_text(
            ctx, label, "IBM Plex Sans", 24,
            left_x, y_offset + 90, TEXT_MUTED, weight='SemiBold', align='left'
        )
        y_offset += 200

    # Right column
    right_x = width - 240
    y_offset = metrics_y
    for value, label in right_metrics:
        draw_text(
            ctx, value, "IBM Plex Mono", 72,
            right_x, y_offset, ROSE, weight='Bold', align='right'
        )
        draw_text(
            ctx, label, "IBM Plex Sans", 24,
            right_x, y_offset + 90, TEXT_MUTED, weight='SemiBold', align='right'
        )
        y_offset += 200

    # --- SPLITS TABLE (clean, spacious) ---
    if splits:
        splits_y = max(y_offset, metrics_y + 400) + 60

        # Section header with gold accent bar
        bar_width = 200
        bar_height = 4
        bar_x = (width - bar_width) / 2
        ctx.set_source_rgb(*GOLD)
        ctx.rectangle(bar_x, splits_y, bar_width, bar_height)
        ctx.fill()

        header_label = "INTERVALS" if is_intervals else "SPLITS"
        header_y = splits_y + 60
        draw_text(
            ctx, header_label, "IBM Plex Sans", 36,
            width / 2, header_y, TEXT_PRIMARY, weight='Bold', align='center'
        )

        # Calculate how many splits fit
        splits_start_y = header_y + 100
        available_height = height - splits_start_y - 200  # Leave room for branding
        row_height = 90 if not is_story else 85

        max_splits = max(1, int(available_height / row_height))
        splits_to_show = splits[:max_splits]
        truncated = len(splits) > max_splits

        for i, split in enumerate(splits_to_show):
            row_y = splits_start_y + (i * row_height)

            # Split number
            split_num = split.get('splitNumber', i + 1)
            draw_text(
                ctx, f"#{split_num}", "IBM Plex Mono", 36,
                240, row_y, TEXT_SECONDARY, weight='SemiBold', align='left'
            )

            # Pace (prominent) — use pre-formatted or format from tenths
            split_fmt = split.get('formatted', {})
            split_pace = split_fmt.get('pace') or format_pace_tenths(split.get('paceTenths'))
            draw_text(
                ctx, split_pace or '--:--', "IBM Plex Mono", 44,
                width / 2 - 100, row_y, TEXT_PRIMARY, weight='Bold', align='center'
            )

            # Watts (if available)
            split_watts = split.get('watts')
            if split_watts is not None:
                draw_text(
                    ctx, f"{split_watts}w", "IBM Plex Mono", 32,
                    width / 2 + 180, row_y, GOLD, weight='SemiBold', align='left'
                )

            # Stroke rate or HR (rightmost)
            split_sr = split.get('strokeRate')
            split_hr = split.get('heartRate')
            if split_sr is not None:
                draw_text(
                    ctx, f"{split_sr} spm", "IBM Plex Mono", 28,
                    width - 200, row_y, TEXT_MUTED, weight='Regular', align='right'
                )

            # In story format, add HR on second line
            if is_story and split_hr is not None:
                hr_y = row_y + 50
                draw_text(
                    ctx, f"HR: {split_hr}", "IBM Plex Mono", 24,
                    width - 200, hr_y, ROSE, weight='Regular', align='right'
                )

        # Show "and X more" if truncated
        if truncated:
            more_y = splits_start_y + (len(splits_to_show) * row_height) + 20
            remaining = len(splits) - max_splits
            draw_text(
                ctx, f"+ {remaining} more split{'s' if remaining != 1 else ''}",
                "IBM Plex Sans", 28,
                width / 2, more_y, TEXT_MUTED, weight='Regular', align='center'
            )

    # --- ATHLETE NAME (if enabled) ---
    if options.get('showName', True):
        athlete = workout_data.get('athlete')
        if athlete:
            athlete_name = f"{athlete.get('firstName', '')} {athlete.get('lastName', '')}".strip()
        else:
            athlete_name = options.get('athleteName', 'Athlete')

        name_y = height - 200
        name_width, name_height = draw_text(
            ctx, athlete_name, "IBM Plex Sans", 44,
            width / 2, name_y, TEXT_SECONDARY, weight='SemiBold', align='center'
        )

        # Subtle gold underline
        underline_width = name_width + 40
        underline_y = name_y + name_height + 20
        ctx.set_source_rgba(*GOLD, 0.4)
        ctx.rectangle((width - underline_width) / 2, underline_y, underline_width, 3)
        ctx.fill()

    # --- CIRCULAR ACCENT ELEMENTS ---
    circle_x = width - 200
    circle_y = height - 200
    circle_radius = 300

    radial = cairo.RadialGradient(circle_x, circle_y, 0, circle_x, circle_y, circle_radius)
    radial.add_color_stop_rgba(0, *ROSE, 0.08)
    radial.add_color_stop_rgba(1, *ROSE, 0)

    ctx.set_source(radial)
    ctx.arc(circle_x, circle_y, circle_radius, 0, 2 * 3.14159)
    ctx.fill()

    # Small solid circle accent (top-right)
    ctx.set_source_rgba(*GOLD, 0.3)
    ctx.arc(width - 140, 100, 40, 0, 2 * 3.14159)
    ctx.fill()

    # --- GRAIN TEXTURE ---
    draw_grain_texture(ctx, width, height, opacity=0.03)

    # --- BRANDING ---
    draw_rowlab_branding(ctx, width, height, format_key, options)

    return surface_to_png_bytes(surface)
