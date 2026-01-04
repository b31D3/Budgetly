# ✅ Semester-Based Cashflow Calculator

## Overview

The calculator now shows **semester-by-semester cashflow** with clear labels like "Fall 2026", "Spring 2027", etc. This makes it easy to see your financial position at each semester.

---

## How It Works

### Semester Structure
- **Fall Semester**: 4 months (September-December)
- **Spring Semester**: 4 months (January-April)
- **Each semester**: Independent calculation of income and expenses

### Step 1: Calculate Expenses per Semester
```
Academic Costs (per semester):
- Tuition: Annual tuition ÷ 2
- Books: Annual books ÷ 2
- Supplies: Annual supplies ÷ 2

Living Costs (per semester):
- Monthly costs × 4 months
- (Rent + Utilities + Groceries + Cell + Transportation + Memberships) × 4

TOTAL SEMESTER EXPENSES = Academic Costs + Living Costs (4 months)
```

### Step 2: Calculate Income per Semester
```
Work Income (per semester):
- School hours/week × 4 weeks/month × 4 months × hourly rate
- Example: 15 hrs/week × 4 weeks × 4 months × $15/hr = $3,600

Financial Aid (per semester):
- Scholarship + Bursary + Grant (as entered)

Savings (per semester):
- Total savings ÷ number of semesters

TOTAL SEMESTER INCOME = Work Income + Financial Aid + Savings Portion
```

### Step 3: Calculate Net Cashflow
```
NET CASHFLOW per SEMESTER = Total Income - Total Expenses

Cumulative Balance = Previous Balance + Net Cashflow
```

---

## Semester Labels

The calculator automatically generates proper semester labels:

| Semester # | Label | Year Calculation |
|------------|-------|------------------|
| 1 | Fall 2026 | Current year |
| 2 | Spring 2027 | Current year + 1 |
| 3 | Fall 2027 | Current year + 1 |
| 4 | Spring 2028 | Current year + 2 |
| 5 | Fall 2028 | Current year + 2 |
| 6 | Spring 2029 | Current year + 3 |

**Logic:**
- Odd semesters (1, 3, 5...) = Fall
- Even semesters (2, 4, 6...) = Spring
- Year increments every 2 semesters

---

## Beginner-Friendly Visualization

### Summary Boxes (Top)
Three large, color-coded boxes showing per-semester averages:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ Income per Semester │  │ Expenses per Semester│  │ Net Cashflow       │
│    $8,000.00       │  │    $9,200.00        │  │   -$1,200.00      │
│   (GREEN BOX)       │  │    (RED BOX)         │  │   (AMBER BOX)      │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### Chart Features
✅ **Thick 5px blue line** - Easy to follow
✅ **Large 8px dots** - Clear semester endpoints
✅ **Dollar amounts on each dot** - Exact values displayed
✅ **Black line at $0** - Break-even reference
✅ **Angled labels** - "Fall 2026", "Spring 2027" (45° angle for readability)
✅ **Large fonts (14-18px)** - Easy to read
✅ **500px tall chart** - Big and clear

### Axis Labels
- **X-axis**: "Semester" (18px bold)
  - Labels: Fall 2026, Spring 2027, Fall 2027, Spring 2028...
- **Y-axis**: "Cashflow ($)" (18px bold)
  - Shows cumulative balance

---

## Example Calculation

### Student Profile:
- **6 semesters** (3 years)
- **$10,000 tuition/year** → $5,000/semester
- **$1,000 books/year** → $500/semester
- **$200 supplies/year** → $100/semester
- **$1,050/month living costs** → $4,200/semester (×4 months)
- **Works 15 hrs/week** during school @ $15/hr
- **$2,000 scholarship**/semester
- **$5,000 savings** → $833/semester

### Semester 1 (Fall 2026):

**Expenses:**
```
Academic: $5,000 (tuition) + $500 (books) + $100 (supplies) = $5,600
Living: $1,050/month × 4 months = $4,200
TOTAL EXPENSES = $9,800
```

**Income:**
```
Work: 15 hrs/week × 4 weeks × 4 months × $15/hr = $3,600
Aid: $2,000 (scholarship)
Savings: $833 ($5,000 ÷ 6 semesters)
TOTAL INCOME = $6,433
```

**Net Cashflow:**
```
$6,433 - $9,800 = -$3,367 (deficit)
```

**Cumulative Balance:** -$3,367

### Full Projection (6 Semesters):

| Semester | Label | Income | Expenses | Net Cashflow | Cumulative Balance |
|----------|-------|--------|----------|--------------|-------------------|
| 1 | Fall 2026 | $6,433 | $9,800 | -$3,367 | -$3,367 |
| 2 | Spring 2027 | $6,433 | $9,800 | -$3,367 | -$6,734 |
| 3 | Fall 2027 | $6,433 | $9,800 | -$3,367 | -$10,101 |
| 4 | Spring 2028 | $6,433 | $9,800 | -$3,367 | -$13,468 |
| 5 | Fall 2028 | $6,433 | $9,800 | -$3,367 | -$16,835 |
| 6 | Spring 2029 | $6,433 | $9,800 | -$3,367 | -$20,202 |

**Result:** Student needs **$20,202 in loans** by graduation.

---

## Key Benefits

### For Students:
✅ **Clear semester labels** - "Fall 2026" is easier to understand than "Month 4"
✅ **Realistic time blocks** - Semesters match academic calendar
✅ **Easy budgeting** - See exactly how much you need per semester
✅ **Visual trend line** - Watch your balance grow or shrink
✅ **Large, bold numbers** - No squinting or guessing

### For Accuracy:
✅ **4-month semesters** - Industry standard
✅ **Proper work hours** - 16 weeks × hours/week
✅ **Accurate costs** - Living costs × 4 months + academic costs
✅ **Cumulative tracking** - Running balance shows total financial position

---

## Chart Interpretation

### Reading the Line:
```
Cashflow ($)
    ↑
 $0 ├──────────────────────●────────── ← Line crosses $0 (break-even)
    │                  ●
-$5k│              ●
    │          ●
-$10k│      ●
    │  ●
-$15k│
    │
-$20k│
    └─────────────────────────────────→
    Fall Spring Fall Spring Fall Spring
    2026  2027  2027  2028  2028  2029
```

**What it means:**
- Line going **down** = losing money each semester
- Line going **up** = saving money each semester
- **Flat line** = breaking even (income = expenses)
- **Below $0** = need loans
- **Above $0** = have savings

---

## Comparison to Other Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Monthly** | Very detailed | Too many data points (12+), overwhelming |
| **Yearly** | High-level view | Doesn't show semester-specific needs |
| **Semester** ✅ | Perfect balance | Matches academic calendar, clear trends |

---

## Summary

Students now get a **clear, semester-by-semester** financial projection:

1. **Three summary boxes** showing per-semester averages
2. **Clean line chart** with semester labels (Fall 2026, Spring 2027...)
3. **Thick blue line** showing cumulative balance
4. **Large dots** at each semester with exact dollar amounts
5. **Simple explanation** of how to read the chart

**Perfect for students planning their finances!** 🎓💰
