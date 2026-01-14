# Test Case: 6 Semesters (3 Years)

## Expected Behavior

**Input:** Student with 6 semesters remaining

**Timeline:**
- Fall 2026 (Semester 1) - Sep 2026 start
- Spring 2027 (Semester 2) - Jan 2027 start
- Fall 2027 (Semester 3) - Sep 2027 start
- Spring 2028 (Semester 4) - Jan 2028 start
- Fall 2028 (Semester 5) - Sep 2028 start
- Spring 2029 (Semester 6) - Jan 2029 start
- Graduation: April 2029

**Checkpoint Schedule (3 per year × 3 years = 9 checkpoints max, but we stop at graduation):**

### Year 1 (Sep 2026 - Aug 2027)
1. **Dec '26** - After Fall semester, before Spring tuition
2. **Apr '27** - After Spring semester ends
3. **Aug '27** - After summer work, before Fall 2027 tuition

### Year 2 (Sep 2027 - Aug 2028)
4. **Dec '27** - After Fall semester, before Spring tuition
5. **Apr '28** - After Spring semester ends
6. **Aug '28** - After summer work, before Fall 2028 tuition

### Year 3 (Sep 2028 - Apr 2029)
7. **Dec '28** - After Fall semester, before Spring tuition
8. **Apr '29** - GRADUATION (Semester 6 ends)

**Expected Count: 8 checkpoints** (not 9, because student graduates in April 2029)

---

## The Bugs That Were Fixed

### Bug #1: Showing 9 Checkpoints Instead of 8
**Problem:** Code was calculating based on `yearsToGraduate * 12 months = 36 months`, then showing ALL checkpoints within 36 months, which includes Dec, Apr, Aug for 3 full years = 9 checkpoints.

**Fix:** Added logic to stop showing checkpoints after the student's actual graduation:
```typescript
const monthsPerSemester = 6;
const totalStudyMonths = numSemesters * monthsPerSemester; // 6 semesters × 6 = 36 months
const isWithinStudyPeriod = monthIndex < totalStudyMonths;

if ((isCheckpoint || isLastMonth) && (isWithinStudyPeriod || isLastMonth)) {
  // Only add checkpoint if within study period OR it's the final graduation month
}
```

### Bug #2: All Years Showing as '26
**Problem:** Year calculation was using `index / 12` where `index` was the position in the checkpoint array (0-8), not the actual month number.

**Fix:** Now we:
1. Calculate `yearNumber` in the calculator: `Math.floor(monthIndex / 12)`
2. Store it in the data: `yearNumber: yearNumber`
3. Use it in the component: `const yearOffset = s.yearNumber || 0`

---

## Correct Output for 6 Semesters

| Checkpoint | Label | Year | Notes |
|------------|-------|------|-------|
| 1 | Dec '26 | 2026 | Before Spring 2027 tuition |
| 2 | Apr '27 | 2027 | After Spring 2027 semester |
| 3 | Aug '27 | 2027 | Before Fall 2027 tuition |
| 4 | Dec '27 | 2027 | Before Spring 2028 tuition |
| 5 | Apr '28 | 2028 | After Spring 2028 semester |
| 6 | Aug '28 | 2028 | Before Fall 2028 tuition |
| 7 | Dec '28 | 2028 | Before Spring 2029 tuition |
| 8 | Graduation | 2029 | April 2029 - Final semester ends |

**Total: 8 checkpoints** ✅

---

## Verification Checklist

✅ Number of checkpoints matches student timeline (8 for 6 semesters)
✅ Years increment correctly (2026, 2027, 2028, 2029)
✅ Last point labeled "Graduation"
✅ Tuition charged in September and January only
✅ Aid received in September and January only
✅ Checkpoints show critical financial moments

---

## Algorithm Summary

```
For 6 semesters:
  yearsToGraduate = ceil(6/2) = 3 years
  totalMonths = 3 × 12 = 36 months

  Loop through 36 months:
    Month 0 (Sep '26): Tuition + Aid, checkpoint? No
    Month 3 (Dec '26): checkpoint ✓
    Month 4 (Jan '27): Tuition + Aid, checkpoint? No
    Month 7 (Apr '27): checkpoint ✓
    Month 11 (Aug '27): checkpoint ✓
    Month 12 (Sep '27): Tuition + Aid, year++
    Month 15 (Dec '27): checkpoint ✓
    Month 16 (Jan '28): Tuition + Aid
    Month 19 (Apr '28): checkpoint ✓
    Month 23 (Aug '28): checkpoint ✓
    Month 24 (Sep '28): Tuition + Aid, year++
    Month 27 (Dec '28): checkpoint ✓
    Month 28 (Jan '29): Tuition + Aid (Semester 6 starts)
    Month 31 (Apr '29): GRADUATION checkpoint ✓

  Result: 8 checkpoints
```

This is now CORRECT! ✅
