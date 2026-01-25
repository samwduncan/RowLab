---
phase: 12
plan: 06
subsystem: photo-upload
tags: [face-detection, image-cropping, photo-upload, face-api.js, react-easy-crop]
dependency-graph:
  requires: [12-01]
  provides: [photo-upload-components, face-detection-hook, face-detection-utils]
  affects: [athlete-profiles, settings-photos]
tech-stack:
  added: []
  patterns: [face-detection-api, image-cropping, drag-drop-upload, lazy-model-loading]
key-files:
  created:
    - public/models/tiny_face_detector_model-weights_manifest.json
    - public/models/tiny_face_detector_model-shard1
    - public/models/face_landmark_68_model-weights_manifest.json
    - public/models/face_landmark_68_model-shard1
    - src/v2/utils/faceDetection.ts
    - src/v2/hooks/useFaceDetection.ts
    - src/v2/components/settings/PhotoUpload.tsx
    - src/v2/components/settings/PhotoCropper.tsx
    - src/v2/components/settings/index.ts
  modified:
    - src/v2/types/athletes.ts
decisions:
  - id: 12-06-1
    decision: Place components in src/v2/components/settings/ following existing codebase pattern
    rationale: Codebase uses src/v2/components/{feature}/ not src/v2/features/{feature}/components/
  - id: 12-06-2
    decision: Singleton pattern for face detection model loading with loading promise cache
    rationale: Prevents multiple simultaneous model loads if multiple components mount
  - id: 12-06-3
    decision: 30% padding on detected face bounding box for headshot crop
    rationale: Standard headshot framing includes head plus some shoulders/neck area
  - id: 12-06-4
    decision: Max 400px output size for cropped images
    rationale: Reasonable size for profile photos, balances quality vs storage/bandwidth
  - id: 12-06-5
    decision: Added avatar field to Athlete type
    rationale: Required for storing cropped photo URL on athlete record (Rule 2 - missing critical)
metrics:
  duration: 5m 13s
  completed: 2026-01-25
---

# Phase 12 Plan 06: Athlete Photo Upload with Face Detection Summary

**One-liner:** Photo upload with drag-drop, AI face detection via face-api.js, react-easy-crop cropper, and API persistence via useAthletes hook

## What Was Built

### Task 1: Download Face Detection Models

Downloaded face-api.js pre-trained models to `/public/models/`:
- `tiny_face_detector_model-*`: Fast face detection (~190KB)
- `face_landmark_68_model-*`: 68-point facial landmarks (~350KB)

Models are served statically and loaded lazily when PhotoCropper mounts.

### Task 2: Face Detection Utility and Hook

**faceDetection.ts:**
- `loadFaceDetectionModels()`: Singleton loader with promise caching
- `areModelsLoaded()`: Check if models are ready
- `detectFace()`: Detect face and return expanded bounding box for headshot crop
  - Expands by 30% for proper headshot framing
  - Makes crop area square using larger dimension
  - Ensures crop stays within image bounds

**useFaceDetection.ts:**
- React hook for face detection functionality
- Lazy loads models on first use
- Exposes: `modelsLoaded`, `modelsLoading`, `detect`, `error`

### Task 3: PhotoUpload and PhotoCropper Components

**PhotoUpload.tsx:**
- Drag-and-drop zone with dashed border styling
- File picker button (accepts image/*)
- Validation: 5MB max, JPEG/PNG/WebP only
- Preview mode with current photo and remove button
- Loading state during file processing
- WCAG keyboard accessibility (Enter/Space to activate)

**PhotoCropper.tsx:**
- Uses react-easy-crop Cropper component
- Integrates useFaceDetection hook
- Auto-detection flow:
  1. Loads models if needed
  2. Runs face detection on image
  3. Auto-positions crop if face detected
  4. Falls back to center crop if no face
- Controls: Zoom slider (1x-3x), manual drag positioning
- Square aspect ratio (1:1) for standardized headshots
- API persistence via useAthletes hook on save
- Status messages: detecting, face found, no face found

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component location | `src/v2/components/settings/` | Follows existing codebase pattern |
| Model loading | Singleton with promise cache | Prevents duplicate loads |
| Face padding | 30% expansion | Standard headshot framing |
| Output size | Max 400px | Quality vs storage balance |
| Crop shape | Square (1:1) | Standardized athlete headshots |

## Files Changed

| File | Change |
|------|--------|
| `public/models/*` | Created - 4 face detection model files |
| `src/v2/utils/faceDetection.ts` | Created - face detection utility |
| `src/v2/hooks/useFaceDetection.ts` | Created - React hook for face detection |
| `src/v2/components/settings/PhotoUpload.tsx` | Created - photo upload with drag-drop |
| `src/v2/components/settings/PhotoCropper.tsx` | Created - cropper with face detection |
| `src/v2/components/settings/index.ts` | Created - barrel exports |
| `src/v2/types/athletes.ts` | Modified - added avatar field |

## Commits

| Hash | Message |
|------|---------|
| `7548f24` | chore(12-06): download face-api.js models for face detection |
| `d6894c2` | feat(12-06): create face detection utility and hook |
| `03ead58` | feat(12-06): create PhotoUpload and PhotoCropper components |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added avatar field to Athlete type**

- **Found during:** Task 3
- **Issue:** Athlete type lacked avatar field needed for storing cropped photo URL
- **Fix:** Added `avatar: string | null` to Athlete interface in types/athletes.ts
- **Files modified:** src/v2/types/athletes.ts
- **Commit:** 03ead58

**2. [Rule 3 - Blocking] Adjusted file path structure**

- **Found during:** Task 2
- **Issue:** Plan specified `src/v2/features/settings/` but codebase uses `src/v2/components/{feature}/`
- **Fix:** Created files in `src/v2/components/settings/` and `src/v2/hooks/` following existing patterns
- **Files modified:** All component files
- **Commit:** d6894c2, 03ead58

## How to Use

### PhotoUpload Component
```typescript
import { PhotoUpload } from '@/v2/components/settings';

<PhotoUpload
  onImageSelected={(imageUrl) => setSelectedImage(imageUrl)}
  currentPhoto={athlete.avatar}
  onRemove={() => handleRemovePhoto()}
/>
```

### PhotoCropper Component
```typescript
import { PhotoCropper } from '@/v2/components/settings';

{selectedImage && (
  <PhotoCropper
    image={selectedImage}
    athleteId={athlete.id}
    onCropComplete={(croppedUrl) => {
      setSelectedImage(null);
      // Athlete photo updated via useAthletes hook
    }}
    onCancel={() => setSelectedImage(null)}
  />
)}
```

### Complete Flow
```typescript
function AthletePhotoEditor({ athlete }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <PhotoUpload
        onImageSelected={setSelectedImage}
        currentPhoto={athlete.avatar}
      />

      {selectedImage && (
        <PhotoCropper
          image={selectedImage}
          athleteId={athlete.id}
          onCropComplete={() => setSelectedImage(null)}
          onCancel={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
```

## Next Phase Readiness

Ready for 12-06b (Backend API for photo storage) - all frontend components built and wired to useAthletes hook.

**Note:** PhotoCropper calls `updateAthlete({ id, avatar })` which requires the backend to support the avatar field on PATCH /api/v1/athletes/:id. This is implemented in plan 12-06b.

**Blockers:** None
**Concerns:** None
