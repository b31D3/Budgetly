# 📊 Semester-by-Semester Cashflow Calculation Formulas

## Overview

This calculator uses **exact formulas** to track student finances semester-by-semester with a **rolling savings balance**.

**Semester Sequence:** Winter → Summer → Fall → Winter → Summer → Fall...

---

## Input Data

### Academic Costs:
- **Tuition** (annual amount, $)
- **Books** (per semester, $)
- **Supplies** (per semester, $)
- **Semesters remaining** (count)

### Living Expenses (Monthly):
- **Rent** ($/month)
- **Food/Groceries** ($/month)
- **Phone bill** ($/month)
- **Subscriptions/Memberships** ($/month)

### Work Income:
- **School hours per week** (Sep-Apr: Fall + Winter)
- **Summer hours per week** (May-Aug)
- **Pay rate** ($/hour)

### Financial Aid:
- **Bursary** (per semester, $)
- **Scholarship** (per semester, $)
- **Grant** (per semester, $)

### Starting Position:
- **Initial savings** ($)

---

## Core Formulas

### 1. School Semester Expense (Winter/Fall)

```
Semester Expense = (Tuition ÷ 2) + 4(Rent + Food + Phone + Subscriptions) + Books + Supplies
```

**Breakdown:**
- `(Tuition ÷ 2)` = Half of annual tuition (paid each Winter and Fall)
- `4(Monthly costs)` = 4 months of living expenses
- `Books` = Books for this semester
- `Supplies` = Supplies for this semester

**Example:**
```
Tuition: $10,000/year → $5,000 per semester
Monthly costs: $1,050
Books: $300/semester
Supplies: $100/semester

Winter Expense = $5,000 + 4($1,050) + $300 + $100
              = $5,000 + $4,200 + $300 + $100
              = $9,600
```

---

### 2. School Semester Income (Winter/Fall)

```
Semester Income = 16 × School hours/week × Pay rate + Bursary
```

**Formula breakdown:**
- `16` = 4 weeks/month × 4 months
- Works out to: 4 weeks × 4 months × School hours/week × Pay rate

**Example:**
```
School hours: 15 hrs/week
Pay rate: $15/hr
Bursary: $2,000

Winter Income = 16 × 15 × $15 + $2,000
             = 240 × $15 + $2,000
             = $3,600 + $2,000
             = $5,600
```

---

### 3. Summer Expense

```
Summer Expense = 4(Rent + Food + Phone + Subscriptions)
```

**Note:** NO tuition, books, or supplies in summer

**Example:**
```
Monthly costs: $1,050

Summer Expense = 4 × $1,050
              = $4,200
```

---

### 4. Summer Income

```
Summer Income = 16 × Summer hours/week × Pay rate
```

**Note:** NO bursary/financial aid in summer

**Example:**
```
Summer hours: 40 hrs/week
Pay rate: $15/hr

Summer Income = 16 × 40 × $15
             = 640 × $15
             = $9,600
```

---

### 5. Available Funds (Each Semester)

```
Available Funds = Semester Income + Current Savings Balance
```

This shows **total money available** at the start of each semester.

**Example (Winter with $5,000 saved):**
```
Available Funds = $5,600 (income) + $5,000 (savings)
               = $10,600
```

---

### 6. Semester Cashflow

```
Semester Cashflow = Available Funds - Semester Expense
```

**Result:**
- **Positive** = Surplus (money left over)
- **Negative** = Deficit (need loans or additional funds)

**Example:**
```
Cashflow = $10,600 - $9,600
        = $1,000 (surplus)
```

---

### 7. New Savings Balance (Carries Forward)

```
New Savings Balance = Semester Cashflow
```

This balance **rolls forward** to become the starting savings for the next semester.

**Example sequence:**
```
Winter 2027: End with $1,000
  ↓
Summer 2027: Start with $1,000
  ↓
Summer 2027: End with $6,400
  ↓
Fall 2027: Start with $6,400
  ↓
(continues...)
```

---

### 8. Total Annual Income

```
Total Annual Income = Summer Income + School Income (Winter + Fall)
```

This shows the **total money earned** in one academic year.

**Example:**
```
Summer Income: 16 × 40 × $15 = $9,600
Winter Income: 16 × 15 × $15 + $2,000 = $5,600
Fall Income: 16 × 15 × $15 + $2,000 = $5,600

Total Annual Income = $9,600 + $5,600 + $5,600
                   = $20,800
```

---

## Complete Example

### Student Profile:
- **6 semesters** remaining
- **$10,000 tuition**/year
- **$300 books**/semester
- **$100 supplies**/semester
- **$1,050/month** living costs
- Works **15 hrs/week** during school @ $15/hr
- Works **40 hrs/week** during summer @ $15/hr
- **$2,000 bursary**/semester
- **$5,000 initial savings**

---

### Winter 2027 (Semester 1):

**Expense:**
```
= ($10,000 ÷ 2) + 4($1,050) + $300 + $100
= $5,000 + $4,200 + $300 + $100
= $9,600
```

**Income:**
```
= 16 × 15 × $15 + $2,000
= $3,600 + $2,000
= $5,600
```

**Available Funds:**
```
= $5,600 + $5,000 (initial savings)
= $10,600
```

**Cashflow:**
```
= $10,600 - $9,600
= $1,000
```

**New Savings Balance:** $1,000 ✅

---

### Summer 2027:

**Expense:**
```
= 4($1,050)
= $4,200
```

**Income:**
```
= 16 × 40 × $15
= $9,600
```

**Available Funds:**
```
= $9,600 + $1,000 (from Winter)
= $10,600
```

**Cashflow:**
```
= $10,600 - $4,200
= $6,400
```

**New Savings Balance:** $6,400 ✅

---

### Fall 2027 (Semester 2):

**Expense:**
```
= $5,000 + $4,200 + $300 + $100
= $9,600
```

**Income:**
```
= $3,600 + $2,000
= $5,600
```

**Available Funds:**
```
= $5,600 + $6,400 (from Summer)
= $12,000
```

**Cashflow:**
```
= $12,000 - $9,600
= $2,400
```

**New Savings Balance:** $2,400 ✅

---

## Key Insights

### Rolling Balance Flow:
```
Winter → earn $5,600, spend $9,600 → end with $1,000
  ↓
Summer → earn $9,600, spend $4,200 → end with $6,400
  ↓
Fall → earn $5,600, spend $9,600 → end with $2,400
  ↓
(pattern continues...)
```

### Financial Pattern:
- **Winter/Fall:** Tuition payments drain savings
- **Summer:** Rebuild savings (high work hours, no tuition)
- **Savings accumulate** when summer surplus exceeds academic deficits
- **Deficits occur** when tuition payments exceed available funds

---

## Graph Visualization

For each semester, the chart shows three lines:

### 💚 Green Line: Available Funds
- **Formula:** `Semester Income + Current Savings Balance`
- **Meaning:** Total money you have at the START of the semester

### ❤️ Red Line: Expenses
- **Formula:** See formulas #1 and #3 above
- **Meaning:** What you need to pay during the semester

### 💙 Blue Line: Ending Balance
- **Formula:** `Available Funds - Expenses`
- **Meaning:** What's left AFTER paying expenses (rolls to next semester)

---

## Critical Understanding

✅ **Available Funds ≥ Expenses** → You can afford this semester
⚠️ **Available Funds < Expenses** → You need loans for this semester
💰 **Ending Balance < $0** → You're in debt (negative savings balance)

The calculator shows **exactly when** you'll run out of money and **how much** you'll need to borrow!

---

## Formula Summary Table

| Item | Formula | Notes |
|------|---------|-------|
| **Winter/Fall Expense** | `(Tuition÷2) + 4(Monthly) + Books + Supplies` | Includes tuition |
| **Winter/Fall Income** | `16 × School hrs × Rate + Bursary` | 4 months school work |
| **Summer Expense** | `4(Monthly)` | Living only, no tuition |
| **Summer Income** | `16 × Summer hrs × Rate` | 4 months full-time work |
| **Available Funds** | `Income + Savings Balance` | Total available |
| **Cashflow** | `Available - Expense` | Surplus/deficit |
| **New Balance** | `Cashflow` | Carries forward |

All formulas use **exact calculations** with no averaging or approximations!
