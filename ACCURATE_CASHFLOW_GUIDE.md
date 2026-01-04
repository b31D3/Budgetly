# ✅ Accurate Semester-by-Semester Cashflow Calculator

## Overview

The calculator now shows **exactly when students have enough money** and **when they'll run short** with a rolling savings balance that flows semester-to-semester.

**Semester Sequence:** Winter → Summer → Fall (tuition paid in Winter & Fall)

---

## How It Works

### Core Concept: Rolling Savings Balance

Instead of treating each semester independently, the calculator tracks money **flowing from one period to the next**:

```
Starting Savings
    ↓
Winter 2027: Starting balance + school income + aid, pay expenses + tuition → Ending Balance
    ↓ (rolls forward)
Summer 2027: Starting balance + summer income, pay living costs → Ending Balance
    ↓ (rolls forward)
Fall 2027: Starting balance + school income + aid, pay expenses + tuition → Ending Balance
    ↓ (rolls forward)
Winter 2028: Starting balance + school income + aid, pay expenses + tuition → Ending Balance
    ↓ (continues...)
```

---

## Calculation Formula

### For Each Semester/Period:

```javascript
// Step 1: Calculate available funds
Available Funds = Starting Savings Balance + Income Earned This Period

// Step 2: Pay expenses
Ending Balance = Available Funds - Expenses This Period

// Step 3: Roll forward
Next Period's Starting Balance = This Period's Ending Balance
```

### Income Sources Per Period:

**Winter/Fall Semesters (Academic):**
- Work income: 16 × school hours/week × hourly rate
- Financial aid: bursary (per semester)
- **Total Annual Income** = Summer income + School income (Winter + Fall)

**Summer Periods:**
- Work income: 16 × summer hours/week × hourly rate
- Financial aid: $0 (typically not available)

### Expenses Per Period:

**Winter/Fall Semesters (Academic):**
- Academic costs: (tuition ÷ 2) + books + supplies
- Living costs: 4 months × monthly living expenses
- **Tuition is paid in BOTH Winter and Fall**

**Summer Periods:**
- Academic costs: $0 (no tuition)
- Living costs: 4 months × monthly living expenses

---

## Example Walkthrough

### Student Profile:
- **6 semesters** (3 years)
- **$10,000 tuition/year** → $5,000/semester
- **$1,000 books/year** → $500/semester
- **$200 supplies/year** → $100/semester
- **$1,050/month living costs**
- Works **15 hrs/week** during school @ $15/hr
- Works **40 hrs/week** during summer @ $15/hr
- **$2,000 scholarship/semester**
- **$5,000 starting savings**

---

### Winter 2027 (Semester 1):

**Income:**
- Work: 16 × 15 hrs × $15 = $3,600
- Aid: $2,000 (bursary)
- Total Income: $5,600

**Expenses:**
- Academic: $5,000 (tuition÷2) + $300 (books) + $100 (supplies) = $5,400
- Living: $1,050 × 4 months = $4,200
- Total Expenses: $9,600

**Cashflow:**
- Starting savings: $5,000 (initial)
- Available funds: $5,000 + $5,600 = $10,600
- Ending balance: $10,600 - $9,600 = **$1,000**

✅ **First tuition payment covered!** (small surplus remains)

---

### Summer 2027 (Period 2):

**Income:**
- Work: 16 × 40 hrs × $15 = **$9,600**
- Aid: $0
- Total Income: $9,600

**Expenses:**
- Academic: $0 (no tuition)
- Living: $1,050 × 4 months = $4,200
- Total Expenses: $4,200

**Cashflow:**
- Starting savings: $1,000 (from Winter)
- Available funds: $1,000 + $9,600 = $10,600
- Ending balance: $10,600 - $4,200 = **$6,400**

✅ **Summer work rebuilds savings!** (ready for Fall)

---

### Fall 2027 (Semester 2):

**Income:**
- Work: 16 × 15 hrs × $15 = $3,600
- Aid: $2,000
- Total Income: $5,600

**Expenses:**
- Academic: $5,000 + $300 + $100 = $5,400
- Living: $4,200
- Total Expenses: $9,600

**Cashflow:**
- Starting savings: $6,400 (from Summer)
- Available funds: $6,400 + $5,600 = $12,000
- Ending balance: $12,000 - $9,600 = **$2,400**

✅ **Second tuition payment covered!** (summer savings helped)

---

### Winter 2028 (Semester 3):

**Income:**
- Work: $3,600
- Aid: $2,000
- Total Income: $5,600

**Expenses:**
- Academic: $5,400
- Living: $4,200
- Total Expenses: $9,600

**Cashflow:**
- Starting savings: $2,400 (from Fall)
- Available funds: $2,400 + $5,600 = $8,000
- Ending balance: $8,000 - $9,600 = **-$1,600**

⚠️ **First deficit!** (need $1,600 in loans or work more hours)

---

## Chart Visualization

The chart shows **three lines** to make it crystal clear:

### 💚 Green Line: Available Funds
- Shows: Starting savings + income for that period
- Meaning: "How much money do I have going INTO this semester?"

### ❤️ Red Line: Expenses
- Shows: Total costs for that period (tuition + living)
- Meaning: "How much do I need to pay THIS semester?"

### 💙 Blue Line: Ending Balance
- Shows: What's left after paying expenses
- Meaning: "How much money do I have LEFT OVER?"
- **This rolls into the next semester's starting balance**

---

## Reading the Chart

### When Green is Above Red:
✅ **You have enough money** (surplus)
- Available funds > Expenses
- Ending balance will be positive

### When Red is Above Green:
⚠️ **You're short money** (deficit)
- Expenses > Available funds
- Ending balance will be negative (need loans)

### When Blue Line Goes Below $0:
💰 **You've run out of savings**
- Need to borrow money
- Shows exactly how much you need

---

## Key Insights Students See

### 1. **Starting Position**
"Do I have enough savings to start?"
- First period's available funds shows initial cushion

### 2. **Critical Periods**
"When do I run out of money?"
- Blue line dropping below $0 = need loans
- Shows exactly which semester needs funding

### 3. **Summer Recovery**
"Does summer work help?"
- Summer periods typically show surplus
- Green line jumps up (more work hours)
- Red line drops down (no tuition)
- Blue line recovers

### 4. **Final Position**
"How much debt will I have at graduation?"
- Last period's ending balance = final result
- Negative = total loans needed
- Positive = graduation with savings!

---

## Summary Boxes

Four key metrics shown at the top:

1. **Starting Savings** (Blue)
   - Initial cushion student has

2. **Total Annual Income** (Green)
   - Sum of first 2 semesters' income
   - Shows yearly earning power

3. **Total Annual Expenses** (Red)
   - Sum of first 2 semesters' expenses
   - Shows yearly cost burden

4. **Final Balance** (Green/Red)
   - Last semester's ending balance
   - Green if positive (surplus)
   - Red if negative (loans needed)

---

## Realistic Financial Flow

This approach models **real student finances** with accurate semester sequencing:

✅ Money earned in one period helps pay for the next
✅ Summer work rebuilds savings after tuition payments
✅ Students see exactly when they'll need loans
✅ Final balance shows total financial position at graduation

**Example Pattern (Winter → Summer → Fall):**
```
Winter → pay tuition (drain savings)
Summer → rebuild savings (work full-time, no tuition)
Fall → pay tuition (drain savings again)
Winter → pay tuition (may need loans if savings depleted)
Summer → rebuild savings...
```

**Total Annual Income = Summer income + School income (Winter + Fall)**

This **sawtooth pattern** (Summer peaks, Winter/Fall valleys) accurately reflects student finances!

---

## Benefits

### For Students:
1. **Know when to apply for loans** (see deficit periods in advance)
2. **Plan summer work** (see how it helps balance)
3. **Set realistic expectations** (see true financial picture)
4. **Make informed decisions** (can I afford this program?)

### For Accuracy:
1. **Rolling balance** = money flows realistically
2. **Period-specific income** = school vs summer hours
3. **Period-specific expenses** = tuition vs no tuition
4. **No averaging** = see actual highs and lows

---

## Bottom Line

**Students can now answer:**
- ✅ "Do I have enough money to start?"
- ✅ "When will I run out?"
- ✅ "How much do I need to borrow?"
- ✅ "Will I graduate with debt or savings?"

**All shown visually on an easy-to-read chart!** 📊💰
