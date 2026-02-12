"""
Erg Summary Card - Design B (Fresh Direction)
Editorial/artistic approach with full-bleed gradients and dynamic asymmetric layout.
Handles all C2 workout types with type-aware presentation:
- Steady-state (JustRow, FixedTimeSplits, FixedDistanceSplits): clean split table
- Interval workouts: work/rest alternating rows with recovery HR
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

# Muted teal for rest rows — distinct from gold/rose work accent
REST_COLOR = (0.4, 0.6, 0.65)


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


def format_rest_time(tenths):
    """Format rest time from tenths of seconds to readable string"""
    if not tenths:
        return None
    total_seconds = tenths / 10
    mins = int(total_seconds // 60)
    secs = int(total_seconds % 60)
    if mins > 0:
        return f"{mins}:{secs:02d}"
    return f":{secs:02d}"


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
    is_intervals = data.get('isInterval', False)
    splits = data.get('splits', [])

    distance = data.get('distanceM')

    # For interval workouts, build a descriptive title like "7x500m"
    if is_intervals and splits:
        n = len(splits)
        # Check if all intervals have the same distance (fixed distance interval)
        distances = [s.get('distanceM') for s in splits if s.get('distanceM')]
        if distances and len(set(distances)) == 1:
            d = distances[0]
            rest_label = ''
            rest_time = splits[0].get('restTime')
            if rest_time:
                rest_label = f"/{format_rest_time(rest_time)}r"
            return f"{n}x{d}m{rest_label} {machine_label}"

        # Check if all intervals have the same time (fixed time interval)
        times = [s.get('timeSeconds') for s in splits if s.get('timeSeconds')]
        if times and len(set(int(t) for t in times)) == 1:
            t = format_time(times[0])
            rest_label = ''
            rest_time = splits[0].get('restTime')
            if rest_time:
                rest_label = f"/{format_rest_time(rest_time)}r"
            return f"{n}x{t}{rest_label} {machine_label}"

        # Variable intervals — show total
        if distance and distance >= 1000:
            return f"{distance / 1000:.0f}K {machine_label} {type_label}"

    # Non-interval workouts
    if distance and distance >= 1000:
        return f"{distance / 1000:.0f}K {machine_label} {type_label}"
    elif distance:
        return f"{distance}m {machine_label} {type_label}"
    return f"{machine_label} {type_label}"


def is_interval_workout(data):
    """Check if this is an interval-type workout"""
    return data.get('isInterval', False) or 'interval' in (data.get('workoutType') or '').lower()


def compute_pace_stats(splits):
    """Compute average pace and per-split deviation for coloring"""
    paces = [s.get('paceTenths') for s in splits if s.get('paceTenths')]
    if not paces:
        return None, {}
    avg = sum(paces) / len(paces)
    deviations = {}
    for i, split in enumerate(splits):
        p = split.get('paceTenths')
        if p and avg > 0:
            # Negative = faster than avg (good), positive = slower
            deviations[i] = (p - avg) / avg
    return avg, deviations


def draw_wave_pattern(ctx, width, height, color, opacity=0.08):
    """Draw abstract water-inspired wave curves"""
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


def draw_pace_dot(ctx, x, y, deviation, radius=8):
    """Draw a small colored dot indicating pace relative to average.
    deviation < 0 = faster (gold), deviation > 0 = slower (rose/muted)
    """
    if deviation is None:
        return
    if deviation < -0.005:
        # Faster than average — gold
        ctx.set_source_rgba(*GOLD, 0.8)
    elif deviation > 0.005:
        # Slower than average — rose/muted
        ctx.set_source_rgba(*ROSE, 0.5)
    else:
        # Close to average — neutral
        ctx.set_source_rgba(*TEXT_MUTED, 0.4)
    ctx.arc(x, y, radius, 0, 2 * math.pi)
    ctx.fill()


def render_erg_summary_alt(format_key, workout_data, options):
    """
    Design B: Fresh Direction - Editorial/artistic approach.
    Type-aware presentation for all C2 workout types.
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

    # --- Extract formatted values ---
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

    # Compute pace stats for coloring
    avg_pace_val, pace_deviations = compute_pace_stats(splits)

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
    if distance_m and distance_m in (2000, 6000, 500, 1000, 5000):
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

    # --- SPLITS / INTERVALS TABLE ---
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

        # Calculate row heights — intervals need more space for rest rows
        splits_start_y = header_y + 100
        available_height = height - splits_start_y - 200  # Room for branding

        if is_intervals:
            # Work row + rest row for each interval
            work_row_height = 80
            rest_row_height = 50 if is_story else 40
            combo_height = work_row_height + rest_row_height
            max_intervals = max(1, int(available_height / combo_height))
            splits_to_show = splits[:max_intervals]
        else:
            row_height = 90 if not is_story else 85
            max_splits = max(1, int(available_height / row_height))
            splits_to_show = splits[:max_splits]

        truncated = len(splits) > len(splits_to_show)
        current_y = splits_start_y

        for i, split in enumerate(splits_to_show):
            split_fmt = split.get('formatted', {})

            if is_intervals:
                # --- WORK ROW (prominent) ---
                split_num = split.get('splitNumber', i + 1)

                # Pace dot (color-coded relative to average)
                deviation = pace_deviations.get(i)
                if deviation is not None:
                    draw_pace_dot(ctx, 180, current_y + 18, deviation)

                # Split number
                draw_text(
                    ctx, f"#{split_num}", "IBM Plex Mono", 36,
                    210, current_y, TEXT_SECONDARY, weight='SemiBold', align='left'
                )

                # Interval target (distance or time)
                interval_type = split.get('intervalType')
                split_dist = split.get('distanceM')
                if split_dist:
                    target_label = f"{split_dist}m"
                else:
                    target_label = split_fmt.get('time') or format_time(split.get('timeSeconds'))
                draw_text(
                    ctx, target_label, "IBM Plex Mono", 30,
                    380, current_y, TEXT_MUTED, weight='Regular', align='left'
                )

                # Pace (prominent)
                split_pace = split_fmt.get('pace') or format_pace_tenths(split.get('paceTenths'))
                draw_text(
                    ctx, split_pace or '--:--', "IBM Plex Mono", 44,
                    width / 2, current_y, TEXT_PRIMARY, weight='Bold', align='center'
                )

                # Watts (if available)
                split_watts = split.get('watts')
                if split_watts is not None:
                    draw_text(
                        ctx, f"{split_watts}w", "IBM Plex Mono", 32,
                        width / 2 + 250, current_y, GOLD, weight='SemiBold', align='left'
                    )

                # HR + stroke rate (right side)
                split_hr = split.get('heartRate')
                split_sr = split.get('strokeRate')
                right_text_parts = []
                if split_sr is not None:
                    right_text_parts.append(f"{split_sr}spm")
                if split_hr is not None:
                    right_text_parts.append(f"{split_hr}bpm")
                if right_text_parts:
                    draw_text(
                        ctx, " / ".join(right_text_parts), "IBM Plex Mono", 26,
                        width - 160, current_y, TEXT_MUTED, weight='Regular', align='right'
                    )

                current_y += 80  # work row height

                # --- REST ROW (muted, indented) ---
                rest_time = split.get('restTime')
                rest_hr = split.get('heartRateRest')
                rest_dist = split.get('restDistance')

                if rest_time or rest_hr:
                    rest_parts = []
                    if rest_time:
                        rest_parts.append(f"rest {format_rest_time(rest_time)}")
                    if rest_dist:
                        rest_parts.append(f"{rest_dist}m")
                    if rest_hr:
                        rest_parts.append(f"HR {rest_hr}")
                        # Show recovery delta if we have peak HR
                        hr_ending = split.get('heartRateEnding')
                        if hr_ending and rest_hr:
                            delta = hr_ending - rest_hr
                            if delta > 0:
                                rest_parts.append(f"(-{delta})")

                    rest_text = "  ".join(rest_parts)

                    # Subtle rest indicator line
                    ctx.set_source_rgba(*REST_COLOR, 0.15)
                    ctx.rectangle(240, current_y - 5, width - 480, 1)
                    ctx.fill()

                    draw_text(
                        ctx, rest_text, "IBM Plex Sans", 22,
                        width / 2, current_y, REST_COLOR, weight='Regular', align='center'
                    )

                    current_y += (50 if is_story else 40)  # rest row height
                else:
                    current_y += 15  # small gap when no rest data

            else:
                # --- STEADY-STATE SPLIT ROW ---
                split_num = split.get('splitNumber', i + 1)

                # Pace dot
                deviation = pace_deviations.get(i)
                if deviation is not None:
                    draw_pace_dot(ctx, 180, current_y + 18, deviation)

                draw_text(
                    ctx, f"#{split_num}", "IBM Plex Mono", 36,
                    210, current_y, TEXT_SECONDARY, weight='SemiBold', align='left'
                )

                # Pace
                split_pace = split_fmt.get('pace') or format_pace_tenths(split.get('paceTenths'))
                draw_text(
                    ctx, split_pace or '--:--', "IBM Plex Mono", 44,
                    width / 2 - 100, current_y, TEXT_PRIMARY, weight='Bold', align='center'
                )

                # Watts
                split_watts = split.get('watts')
                if split_watts is not None:
                    draw_text(
                        ctx, f"{split_watts}w", "IBM Plex Mono", 32,
                        width / 2 + 180, current_y, GOLD, weight='SemiBold', align='left'
                    )

                # Stroke rate or HR (rightmost)
                split_sr = split.get('strokeRate')
                split_hr = split.get('heartRate')
                if split_sr is not None:
                    draw_text(
                        ctx, f"{split_sr} spm", "IBM Plex Mono", 28,
                        width - 200, current_y, TEXT_MUTED, weight='Regular', align='right'
                    )

                # Story format: add HR on second line
                if is_story and split_hr is not None:
                    draw_text(
                        ctx, f"HR: {split_hr}", "IBM Plex Mono", 24,
                        width - 200, current_y + 50, ROSE, weight='Regular', align='right'
                    )

                current_y += (90 if not is_story else 85)

        # Show "and X more" if truncated
        if truncated:
            remaining = len(splits) - len(splits_to_show)
            label = "interval" if is_intervals else "split"
            draw_text(
                ctx, f"+ {remaining} more {label}{'s' if remaining != 1 else ''}",
                "IBM Plex Sans", 28,
                width / 2, current_y + 20, TEXT_MUTED, weight='Regular', align='center'
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
