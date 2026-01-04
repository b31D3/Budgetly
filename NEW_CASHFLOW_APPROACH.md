# New Simplified Cashflow Calculation Approach

## Overview

The calculator now uses a **simple total cashflow approach** instead of month-by-month tracking:

1. Calculate **total expenses** for the entire study period
2. Calculate **total income** for the entire study period
3. Calculate **cashflow** = income - expenses
4. Show **cumulative cashflow** at key checkpoints

---

## Calculation Method

### TOTAL EXPENSES

```
Academic Costs:
- Tuition + Books + Supplies (per year) × Years to Graduate

Living Costs:
- (Rent + Utilities + Groceries + Cell + Transportation + Memberships) × Total Months

TOTAL EXPENSES = Academic Costs + Living Costs
```

### TOTAL INCOME

```
Work Income:
- School months (Sep-Apr): Hours/week × 4 weeks × 8 months × Hourly Rate
- Summer months (May-Aug): Hours/week × 4 weeks × 4 months × Hourly Rate
- Yearly work income = School income + Summer income
- Total work income = Yearly income × Years to Graduate

Financial Aid:
- (Scholarship + Bursary + Grant) per semester × Number of Semesters

Savings:
- One-time amount (starting savings)

TOTAL INCOME = Work Income + Financial Aid + Savings
```

### CASHFLOW

```
TOTAL CASHFLOW = TOTAL INCOME - TOTAL EXPENSES

If positive: Surplus (student will have money left over)
If negative: Deficit (student needs loans or additional funding)
```

---

## Checkpoint Display

Instead of showing all 36+ months, we show **cumulative cashflow** at critical moments:

### Checkpoints Per Year:
- **December** - Mid-year checkpoint
- **April** - End of academic year checkpoint
- **August** - End of summer checkpoint

### How Cumulative Works:

```javascript
// Average monthly cashflow
avgMonthlyCashflow = totalCashflow / totalMonths

// At each checkpoint (e.g., December = month 4):
cumulativeCashflow = avgMonthlyCashflow × monthsElapsed
```

### Example for 6 Semesters (3 years):

| Checkpoint | Months Elapsed | Cumulative Cashflow |
|------------|----------------|---------------------|
| Dec '26    | 4              | avgCashflow × 4     |
| Apr '27    | 8              | avgCashflow × 8     |
| Aug '27    | 12             | avgCashflow × 12    |
| Dec '27    | 16             | avgCashflow × 16    |
| Apr '28    | 20             | avgCashflow × 20    |
| Aug '28    | 24             | avgCashflow × 24    |
| Dec '28    | 28             | avgCashflow × 28    |
| Graduation | 36             | avgCashflow × 36 = TOTAL |

---

## Benefits of This Approach

### ✅ Simpler to Understand
- Clear total expenses vs. total income
- One cashflow number shows surplus or deficit
- No confusion about when costs are "due"

### ✅ More Accurate
- Accounts for ALL expenses over the entire period
- Accounts for ALL income sources
- No risk of missing costs or income

### ✅ Better Visualization
- Shows cumulative financial position over time
- Easy to see if/when student runs out of money
- Final balance = total cashflow

---

## Example Calculation

**Student Profile:**
- 6 semesters (3 years)
- $10,000 tuition/year
- $1,000 books/year
- $200 supplies/year
- $1,050/month living costs
- Works 15 hrs/week during school @ $15/hr
- Works 40 hrs/week during summer @ $15/hr
- $2,000 scholarship/semester
- $5,000 savings

### Step 1: Total Expenses
```
Academic: ($10,000 + $1,000 + $200) × 3 years = $33,600
Living: $1,050/month × 36 months = $37,800
TOTAL EXPENSES = $71,400
```

### Step 2: Total Income
```
Work Income:
- School: 15 hrs × 4 weeks × 8 months × $15 = $7,200/year
- Summer: 40 hrs × 4 weeks × 4 months × $15 = $9,600/year
- Total work: ($7,200 + $9,600) × 3 years = $50,400

Financial Aid: $2,000 × 6 semesters = $12,000
Savings: $5,000
TOTAL INCOME = $67,400
```

### Step 3: Cashflow
```
TOTAL CASHFLOW = $67,400 - $71,400 = -$4,000
```

**Result:** Student will need **$4,000 in loans** by graduation.

### Step 4: Checkpoints
```
Average monthly cashflow = -$4,000 / 36 months = -$111.11/month

Dec '26 (month 4): -$111.11 × 4 = -$444
Apr '27 (month 8): -$111.11 × 8 = -$889
Aug '27 (month 12): -$111.11 × 12 = -$1,333
...
Graduation (month 36): -$111.11 × 36 = -$4,000
```

---

## Key Differences from Old Approach

| Old Approach | New Approach |
|--------------|--------------|
| Tracked month-by-month costs | Calculates total expenses upfront |
| Tuition "charged" in Sep/Jan | All tuition included in total |
| Aid "received" in Sep/Jan | All aid included in total |
| Complex month-by-month logic | Simple averaging for checkpoints |
| 9 checkpoints for 6 semesters | 7-8 checkpoints (cleaner) |

---

## Summary

The new approach gives students a clear picture:

1. **Total costs** to complete their degree
2. **Total income** they'll earn/receive
3. **Final cashflow** (surplus or deficit)
4. **Cumulative tracking** showing when they'll need funding

This is much easier to understand and more accurate than trying to track exactly which month tuition is "due" or aid is "received". The bottom line is the same: students see their total financial picture and can plan accordingly.
