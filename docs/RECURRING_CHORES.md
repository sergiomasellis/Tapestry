# Recurring Chores Feature

## Overview

The recurring chores feature allows family members to complete the same chore multiple times and earn points each time. This is perfect for daily or weekly tasks like "feed the dog" or "water the plants."

**Key Feature:** You can set a `max_completions` limit to control how many times a recurring chore can be completed. For example, "feed the dog every day for a week" would have `max_completions: 7`.

## How It Works

### Backend Changes

1. **New Model: `ChoreCompletion`**
   - Tracks each individual completion of a chore
   - Records: `chore_id`, `user_id`, `completed_at`, `points_awarded`
   - Located in `/backend/app/models/models.py`

2. **Updated Completion Logic**
   - When a chore with `is_recurring=True` is completed:
     - Checks if `max_completions` limit has been reached
     - Creates a new `ChoreCompletion` record
     - Awards points via both `ChoreCompletion` and `Point` tables
     - Sets `completed = true` when max is reached, otherwise stays `false`
   - Non-recurring chores work as before (toggle completion)

3. **New API Endpoint**
   - `GET /chores/{chore_id}/completions` - Returns completion history
   - Shows who completed the chore and when
   - Useful for tracking progress over time

4. **Max Completions Enforcement**
   - Returns HTTP 400 error if attempting to complete beyond the limit
   - Error message: "Maximum completions reached (N). This chore cannot be completed again."

### Frontend Changes

1. **Updated ChoreCard Component**
   - Shows completion progress (e.g., "3/7" for 3 of 7 completions)
   - Badge turns green when all completions are done
   - "Complete Again" button disabled when max reached
   - Shows "All Done" status when max completions reached
   - Card fades and gets strikethrough when complete

2. **New Hook: `useChoreCompletions`**
   - Fetches completion history for a specific chore
   - Returns `completions`, `completionCount`, `loading`, `error`, `refetch`
   - Located in `/frontend/src/hooks/useChoreCompletions.ts`

### Database Migrations

- Migration `004` creates the `chore_completions` table
- Migration `005` adds `max_completions` column to `chores` table

## Usage Example

### Creating a Recurring Chore with Max Completions

```json
POST /chores/
{
  "family_id": 1,
  "title": "Feed the dog",
  "description": "Give Buddy his breakfast",
  "emoji": "🐶",
  "point_value": 2,
  "assigned_to": 5,
  "is_group_chore": false,
  "week_start": "2024-01-01",
  "is_recurring": true,
  "recurrence_type": "daily",
  "recurrence_interval": 1,
  "max_completions": 7
}
```

This creates a daily chore that can be completed up to 7 times (once per day for a week).

### Completing a Recurring Chore

```
POST /chores/{chore_id}/complete
```

**Success Response:** Returns the updated chore object with completion tracked.

**Error Response (max reached):**
```json
{
  "detail": "Maximum completions reached (7). This chore cannot be completed again."
}
```

### Viewing Completion History

```
GET /chores/{chore_id}/completions
```

Returns:
```json
[
  {
    "id": 1,
    "user_id": 5,
    "user_name": "Johnny",
    "user_emoji": "🧒",
    "completed_at": "2024-01-15T08:30:00",
    "points_awarded": 2
  },
  {
    "id": 2,
    "user_id": 5,
    "user_name": "Johnny",
    "user_emoji": "🧒",
    "completed_at": "2024-01-14T08:15:00",
    "points_awarded": 2
  }
]
```

## Leaderboard Integration

The leaderboard automatically includes all recurring chore completions:
- Each completion appears as a separate entry in the user's completed chores list
- Total points include all recurring completions
- Timestamps show when each completion occurred
- Uses unique Point IDs to avoid duplicate key issues

## UI Behavior

### Recurring Chores (with max_completions)
- Shows progress badge: "3/7" (completions done / max)
- Badge is blue while in progress, green when complete
- Status shows "All Done" when max reached
- "Complete Again" button disabled when max reached
- Card fades and gets strikethrough when complete

### Recurring Chores (no max_completions)
- Shows count badge: "5x" (unlimited completions)
- Blue "Recurring" status badge
- Can be completed indefinitely
- Never shows as "complete"

### Non-Recurring Chores
- Show "Pending" or "Done" status
- Can be toggled complete/incomplete
- Strikethrough when completed
- Reduced opacity when done

## Technical Notes

- Recurring completions are tracked in both `chore_completions` and `points` tables
- The `points` table maintains backward compatibility with the leaderboard
- Recurring chores with max: `completed = true` when max reached
- Recurring chores without max: `completed` stays `false`
- Completion history is sorted by most recent first
- All endpoints require authentication and family membership validation
- Backend enforces max_completions limit (returns HTTP 400 if exceeded)

## Future Enhancements

Potential improvements for the recurring chores feature:
- Daily/weekly reset logic (reset completion count at start of period)
- Completion streaks and badges
- Automatic chore scheduling based on recurrence rules
- Push notifications for recurring chore reminders
- Analytics dashboard showing completion patterns
- Per-user max completions (e.g., each family member completes 7 times)

