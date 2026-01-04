# Calculation Accuracy Test

## Test Scenario
Let's verify the calculator with a simple, easy-to-verify example:

**Student Profile:**
- Semesters left: 4 (2 years)
- Tuition: $10,000/year
- Books: $1,000/year
- Supplies: $200/year
- Rent: $500/month
- Utilities: $100/month
- Groceries: $300/month
- Cell phone: $50/month
- Transportation: $100/month
- Memberships: $0/month
- Has job: Yes
- Hours during school: 15 hrs/week
- Hours during summer: 40 hrs/week
- Hourly rate: $15/hour
- Scholarship: $2,000/semester
- Bursary: $0
- Grant: $0
- Savings: $5,000

---

## Expected Calculations

### COSTS

**Academic Costs (per semester):**
- Tuition: $10,000 / 2 = $5,000
- Books: $1,000 / 2 = $500
- Supplies: $200 / 2 = $100
- **Total per semester: $5,600**

**Living Costs (per month):**
- Rent: $500
- Utilities: $100
- Groceries: $300
- Cell phone: $50
- Transportation: $100
- Memberships: $0
- **Total per month: $1,050**

**Total costs over 2 years:**
- Academic: 4 semesters × $5,600 = $22,400
- Living: 24 months × $1,050 = $25,200
- **GRAND TOTAL: $47,600**

---

### INCOME

**Work Income (per year):**
- School months (Sep-Apr = 8 months): 15 hrs/week × 4 weeks × 8 months × $15 = $7,200
- Summer months (May-Aug = 4 months): 40 hrs/week × 4 weeks × 4 months × $15 = $9,600
- **Total work income per year: $16,800**
- **Total work income over 2 years: $33,600**

**Financial Aid:**
- Scholarship: $2,000 per semester × 4 semesters = $8,000
- Bursary: $0
- Grant: $0
- **Total aid: $8,000**

**Savings:**
- $5,000 (spread across 24 months = $208.33/month)

**Total Income over 2 years:**
- Work: $33,600
- Aid: $8,000
- Savings: $5,000
- **GRAND TOTAL: $46,600**

---

### FINAL BALANCE

**Income - Costs = Balance**
$46,600 - $47,600 = **-$1,000**

The student will need **$1,000 in loans** by graduation.

---

## Month-by-Month Breakdown (First Year)

### September (Fall semester starts)
- Costs: $1,050 (living) + $5,600 (tuition) = $6,650
- Income: $900 (work: 15 hrs × 4 weeks × $15) + $2,000 (scholarship) + $208.33 (savings) = $3,108.33
- Balance: $0 + $3,108.33 - $6,650 = **-$3,541.67**

### October
- Costs: $1,050
- Income: $900 + $208.33 = $1,108.33
- Balance: -$3,541.67 + $1,108.33 - $1,050 = **-$3,483.34**

### November
- Costs: $1,050
- Income: $1,108.33
- Balance: -$3,483.34 + $1,108.33 - $1,050 = **-$3,425.01**

### December (Checkpoint) ✅
- Costs: $1,050
- Income: $1,108.33
- Balance: -$3,425.01 + $1,108.33 - $1,050 = **-$3,366.68**

### January (Spring semester starts)
- Costs: $1,050 + $5,600 = $6,650
- Income: $900 + $2,000 + $208.33 = $3,108.33
- Balance: -$3,366.68 + $3,108.33 - $6,650 = **-$6,908.35**

### February
- Costs: $1,050
- Income: $1,108.33
- Balance: -$6,908.35 + $1,108.33 - $1,050 = **-$6,850.02**

### March
- Costs: $1,050
- Income: $1,108.33
- Balance: -$6,850.02 + $1,108.33 - $1,050 = **-$6,791.69**

### April (Checkpoint) ✅
- Costs: $1,050
- Income: $1,108.33
- Balance: -$6,791.69 + $1,108.33 - $1,050 = **-$6,733.36**

### May (Summer starts)
- Costs: $1,050
- Income: $2,400 (40 hrs × 4 weeks × $15) + $208.33 = $2,608.33
- Balance: -$6,733.36 + $2,608.33 - $1,050 = **-$5,175.03**

### June
- Costs: $1,050
- Income: $2,608.33
- Balance: -$5,175.03 + $2,608.33 - $1,050 = **-$3,616.70**

### July
- Costs: $1,050
- Income: $2,608.33
- Balance: -$3,616.70 + $2,608.33 - $1,050 = **-$2,058.37**

### August (Checkpoint) ✅
- Costs: $1,050
- Income: $2,608.33
- Balance: -$2,058.37 + $2,608.33 - $1,050 = **-$500.04**

---

## Key Checkpoints Summary

The calculator should show these checkpoints:

1. **Dec '26**: Balance around **-$3,367**
2. **Apr '27**: Balance around **-$6,733**
3. **Aug '27**: Balance around **-$500**
4. **Dec '27**: Balance around **-$3,867**
5. **Apr '28**: Balance around **-$7,233**
6. **Aug '28 (Graduation)**: Balance around **-$1,000**

---

## What the Calculator MUST Get Right

✅ **Tuition is paid in September and January only** (not spread monthly)
✅ **Financial aid is received in September and January only** (when tuition is due)
✅ **Work income varies by month** (school hours Sep-Apr, summer hours May-Aug)
✅ **Living costs are the same every month** ($1,050)
✅ **Savings are spread evenly** ($208.33/month)
✅ **Final balance is cumulative** (tracks every month, shows checkpoints only)
