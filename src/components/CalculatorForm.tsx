import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

const CalculatorForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [studentType, setStudentType] = useState<string>("domestic");
  const [semestersLeft, setSemestersLeft] = useState<string>("");
  const [tuition, setTuition] = useState<string>("");
  const [books, setBooks] = useState<string>("");
  const [supplies, setSupplies] = useState<string>("");
  
  // Housing section
  const [housing, setHousing] = useState<string>("");
  const [rent, setRent] = useState<string>("");
  const [utilities, setUtilities] = useState<string>("");
  
  // Groceries, bills, transportation & memberships section
  const [groceries, setGroceries] = useState<string>("");
  const [cellPhone, setCellPhone] = useState<string>("");
  const [transportation, setTransportation] = useState<string>("");
  const [memberships, setMemberships] = useState<string>("");
  
  // Income section
  const [hasJob, setHasJob] = useState<string>("");
  const [hoursPerWeekSchool, setHoursPerWeekSchool] = useState<string>("");
  const [hoursPerWeekSummer, setHoursPerWeekSummer] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  
  // Financial loan and assistance section
  const [scholarship, setScholarship] = useState<string>("");
  const [bursary, setBursary] = useState<string>("");
  const [grant, setGrant] = useState<string>("");
  
  // Savings section
  const [savings, setSavings] = useState<string>("");
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHousingDropdownOpen, setIsHousingDropdownOpen] = useState(false);

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const housingOptions = ["on-campus", "off-campus"];

  const isStep1Valid = semestersLeft && tuition;
  const isStep2Valid = true; // Expenses are optional

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  // Calculate financial data for each semester
  const calculateSemesterBreakdown = () => {
    const numSemesters = parseInt(semestersLeft) || 0;
    const tuitionPerSemester = (parseInt(tuition) || 0) / 2;
    const booksPerSemester = (parseInt(books) || 0) / 2;
    const suppliesPerSemester = (parseInt(supplies) || 0) / 2;
    
    // Monthly expenses × 4 months per semester
    const rentPerSemester = (parseInt(rent) || 0) * 4;
    const utilitiesPerSemester = (parseInt(utilities) || 0) * 4;
    const groceriesPerSemester = (parseInt(groceries) || 0) * 4;
    const cellPhonePerSemester = (parseInt(cellPhone) || 0) * 4;
    const transportationPerSemester = (parseInt(transportation) || 0) * 4;
    const membershipsPerSemester = (parseInt(memberships) || 0) * 4;
    
    const totalCostsPerSemester = tuitionPerSemester + booksPerSemester + suppliesPerSemester +
                                  rentPerSemester + utilitiesPerSemester + groceriesPerSemester +
                                  cellPhonePerSemester + transportationPerSemester + membershipsPerSemester;
    
    // Income calculation
    // School: 8 months = ~32 weeks
    // Summer: 4 months = ~16 weeks
    const schoolWeeks = 32;
    const summerWeeks = 16;
    const hoursSchool = parseInt(hoursPerWeekSchool) || 0;
    const hoursSummer = parseInt(hoursPerWeekSummer) || 0;
    const rate = parseInt(hourlyRate) || 0;
    
    const totalYearlyIncome = hasJob === "yes" ? 
      (hoursSchool * schoolWeeks * rate) + (hoursSummer * summerWeeks * rate) : 0;
    
    const incomePerSemesterFromWork = totalYearlyIncome / 2;
    
    const scholarshipPerSemester = parseInt(scholarship) || 0;
    const bursaryPerSemester = parseInt(bursary) || 0;
    const grantPerSemester = parseInt(grant) || 0;
    const totalAidPerSemester = scholarshipPerSemester + bursaryPerSemester + grantPerSemester;
    
    const savingsPerSemester = (parseInt(savings) || 0) / numSemesters;
    
    const semesters = [];
    let balance = 0;
    
    for (let i = 0; i < numSemesters; i++) {
      const income = incomePerSemesterFromWork + totalAidPerSemester + savingsPerSemester;
      balance = balance + income - totalCostsPerSemester;
      
      semesters.push({
        semester: i + 1,
        costs: totalCostsPerSemester,
        income: incomePerSemesterFromWork,
        aid: totalAidPerSemester,
        savings: savingsPerSemester,
        totalIncome: income,
        balance: balance
      });
    }
    
    return semesters;
  };

  const semesterData = currentStep === 4 ? calculateSemesterBreakdown() : [];

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section id="calculator" className="w-full bg-background py-16 lg:py-24">
      <div className="container mx-auto px-6">
        {/* Section title */}
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-heading mb-12 animate-fade-in">
          Calculate your cash flow
        </h2>

        {/* Form card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-form rounded-3xl p-8 lg:p-10 shadow-sm animate-slide-up">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              <div className={`progress-dot ${currentStep >= 1 ? 'progress-dot-active' : 'progress-dot-inactive'}`} />
              <div className={`progress-dot ${currentStep >= 2 ? 'progress-dot-active' : 'progress-dot-inactive'}`} />
              <div className={`progress-dot ${currentStep >= 3 ? 'progress-dot-active' : 'progress-dot-inactive'}`} />
              <div className={`progress-dot ${currentStep >= 4 ? 'progress-dot-active' : 'progress-dot-inactive'}`} />
            </div>

            {/* Step 1: School Details */}
            {currentStep === 1 && (
              <>
                {/* Step indicator */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-muted-foreground">Step 1</span>
                  <h3 className="text-2xl font-bold text-heading mt-1">Academic year details</h3>
                </div>

                {/* Form fields */}
                <div className="space-y-8">
                  {/* Student type radio */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-heading">
                      Are you a domestic or international student
                    </Label>
                    <RadioGroup
                      value={studentType}
                      onValueChange={setStudentType}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="domestic" id="domestic" className="border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
                        <Label htmlFor="domestic" className="text-body font-normal cursor-pointer">
                          Domestic
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="international" id="international" className="border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
                        <Label htmlFor="international" className="text-body font-normal cursor-pointer">
                          International
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Semesters dropdown */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-heading">
                      How many semester left till graduation
                    </Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-background border-2 border-border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      >
                        <span className={semestersLeft ? "text-foreground" : "text-muted-foreground"}>
                          {semestersLeft || "Select......"}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden">
                          {semesterOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setSemestersLeft(option);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-foreground"
                            >
                              {option} semester{parseInt(option) > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tuition input */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-heading">
                      Tuition per year
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                        $
                      </div>
                      <input
                        type="number"
                        value={tuition}
                        onChange={(e) => setTuition(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Course material section */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium text-heading">
                      Course material
                    </Label>
                    
                    {/* Books input */}
                    <div className="flex items-center gap-4">
                      <span className="text-body min-w-[160px]">Books</span>
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={books}
                          onChange={(e) => setBooks(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Supplies input */}
                    <div className="flex items-center gap-4">
                      <span className="text-body min-w-[160px]">Supplies & Equipment</span>
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={supplies}
                          onChange={(e) => setSupplies(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next step button */}
                <div className="flex justify-end mt-10">
                  <Button 
                    variant="next" 
                    size="lg" 
                    className="group px-6"
                    onClick={handleNextStep}
                    disabled={!isStep1Valid}
                  >
                    <div className="flex flex-col items-start mr-2">
                      <span className="text-xs text-primary-foreground/70">Next step</span>
                      <span className="font-semibold">Expenses</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Expenses */}
            {currentStep === 2 && (
              <>
                {/* Step indicator */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-muted-foreground">Step 2</span>
                  <h3 className="text-2xl font-bold text-heading mt-1">Expenses</h3>
                </div>

                {/* Form fields */}
                <div className="space-y-10">
                  {/* Housing Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-heading">Housing</h4>
                    
                    {/* Where will you be living */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        Where will you be living
                      </Label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsHousingDropdownOpen(!isHousingDropdownOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-background border-2 border-border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        >
                          <span className={housing ? "text-foreground" : "text-muted-foreground"}>
                            {housing || "Select......"}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isHousingDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        {isHousingDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden">
                            {housingOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setHousing(option);
                                  setIsHousingDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-foreground capitalize"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rent input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much do you pay for rent each month?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={rent}
                          onChange={(e) => setRent(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Utilities input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much do you pay for Utilities each month?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={utilities}
                          onChange={(e) => setUtilities(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Groceries, bills, transportation & memberships Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-heading">Groceries, bills, transportation & memberships</h4>
                    
                    {/* Groceries input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much will you be spending each month for groceries?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={groceries}
                          onChange={(e) => setGroceries(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Cell Phone input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much will your cell phone bill be each month?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={cellPhone}
                          onChange={(e) => setCellPhone(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Transportation input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much will you spend on transportation each month?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={transportation}
                          onChange={(e) => setTransportation(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Memberships input */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much will your memberships and subscriptions cost each month?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={memberships}
                          onChange={(e) => setMemberships(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-10">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-6"
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button 
                    variant="next" 
                    size="lg" 
                    className="group px-6"
                    onClick={handleNextStep}
                  >
                    <div className="flex flex-col items-start mr-2">
                      <span className="text-xs text-primary-foreground/70">Next step</span>
                      <span className="font-semibold">Income & Aid</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Income & Financial Aid */}
            {currentStep === 3 && (
              <>
                {/* Step indicator */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-muted-foreground">Step 3</span>
                  <h3 className="text-2xl font-bold text-heading mt-1">Income & Financial Aid</h3>
                </div>

                {/* Form fields */}
                <div className="space-y-10">
                  {/* Income Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-heading">Income</h4>
                    
                    {/* Do you have a job */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        Do you have a job?
                      </Label>
                      <RadioGroup
                        value={hasJob}
                        onValueChange={setHasJob}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="hasJobYes" className="border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
                          <Label htmlFor="hasJobYes" className="text-body font-normal cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="hasJobNo" className="border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
                          <Label htmlFor="hasJobNo" className="text-body font-normal cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {hasJob === "yes" && (
                      <>
                        {/* Hours per week during school */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium text-heading">
                            How many hours per week do you work during school?
                          </Label>
                          <div className="relative">
                            <input
                              type="number"
                              value={hoursPerWeekSchool}
                              onChange={(e) => setHoursPerWeekSchool(e.target.value)}
                              placeholder="0"
                              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">hours/week</span>
                          </div>
                        </div>

                        {/* Hours per week during summer */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium text-heading">
                            How many hours per week do you work during the summer?
                          </Label>
                          <div className="relative">
                            <input
                              type="number"
                              value={hoursPerWeekSummer}
                              onChange={(e) => setHoursPerWeekSummer(e.target.value)}
                              placeholder="0"
                              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">hours/week</span>
                          </div>
                        </div>

                        {/* Hourly pay rate */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium text-heading">
                            What is your hourly pay rate?
                          </Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                              $
                            </div>
                            <input
                              type="number"
                              value={hourlyRate}
                              onChange={(e) => setHourlyRate(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Financial Loan and Assistance Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-heading">Financial loan and assistance</h4>
                    
                    {/* Scholarship */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much will your scholarship contribute (per semester)?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={scholarship}
                          onChange={(e) => setScholarship(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Bursary */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much bursary will you receive (per semester)?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={bursary}
                          onChange={(e) => setBursary(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Grant */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much grant will you receive (per semester)?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={grant}
                          onChange={(e) => setGrant(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Savings Section */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-heading">Savings</h4>
                    
                    {/* Current savings */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-heading">
                        How much money do you currently have that you plan to use towards your education?
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 dollar-badge">
                          $
                        </div>
                        <input
                          type="number"
                          value={savings}
                          onChange={(e) => setSavings(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-10">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-6"
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button 
                    variant="next" 
                    size="lg" 
                    className="group px-6"
                    onClick={handleNextStep}
                  >
                    <div className="flex flex-col items-start mr-2">
                      <span className="text-xs text-primary-foreground/70">Next step</span>
                      <span className="font-semibold">Results</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && (
              <>
                {/* Step indicator */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-muted-foreground">Step 4</span>
                  <h3 className="text-2xl font-bold text-heading mt-1">Your Financial Forecast</h3>
                </div>

                {/* Results content */}
                <div className="space-y-8">
                  {/* Summary overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-accent rounded-lg p-6">
                      <p className="text-sm text-muted-foreground mb-2">Total Semesters</p>
                      <p className="text-3xl font-bold text-heading">{semestersLeft}</p>
                    </div>
                    <div className="bg-accent rounded-lg p-6">
                      <p className="text-sm text-muted-foreground mb-2">Total Costs</p>
                      <p className="text-3xl font-bold text-heading">
                        ${(semesterData.reduce((sum, s) => sum + s.costs, 0)).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-accent rounded-lg p-6">
                      <p className="text-sm text-muted-foreground mb-2">Final Balance</p>
                      <p className={`text-3xl font-bold ${semesterData.length > 0 && semesterData[semesterData.length - 1].balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(semesterData.length > 0 ? semesterData[semesterData.length - 1].balance : 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Chart visualization */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-heading">Financial Overview Chart</h4>
                    <div className="border-2 border-border rounded-lg p-6 bg-background">
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={semesterData.map((s) => ({
                          semester: `Sem ${s.semester}`,
                          income: s.totalIncome,
                          costs: s.costs,
                          balance: s.balance,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="semester" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => `$${Number(value).toFixed(2)}`}
                            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Bar dataKey="income" fill="#10b981" name="Total Income" />
                          <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                          <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Running Balance" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Semester breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-heading">Semester-by-Semester Breakdown</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {semesterData.map((semester) => (
                        <div key={semester.semester} className="border-2 border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h5 className="font-semibold text-heading">Semester {semester.semester}</h5>
                            <div className={`text-lg font-bold px-3 py-1 rounded ${semester.balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              ${semester.balance.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Costs</p>
                              <p className="font-semibold text-red-600">-${semester.costs.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Work Income</p>
                              <p className="font-semibold text-green-600">+${semester.income.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Financial Aid</p>
                              <p className="font-semibold text-green-600">+${semester.aid.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Savings</p>
                              <p className="font-semibold text-green-600">+${semester.savings.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-accent rounded-lg p-6">
                    <h4 className="font-semibold text-heading mb-3">Financial Insights</h4>
                    <ul className="space-y-2 text-sm text-body">
                      {semesterData.length > 0 && semesterData[semesterData.length - 1].balance >= 0 ? (
                        <>
                          <li>✓ You should have a surplus of ${semesterData[semesterData.length - 1].balance.toFixed(2)} after graduation</li>
                          <li>✓ Your income sources are sufficient to cover all expenses</li>
                        </>
                      ) : (
                        <>
                          <li>⚠ You will have a deficit of ${Math.abs(semesterData[semesterData.length - 1].balance).toFixed(2)} by graduation</li>
                          <li>⚠ You may need to consider additional income sources or student loans</li>
                        </>
                      )}
                      <li>• Average cost per semester: ${(semesterData.reduce((sum, s) => sum + s.costs, 0) / semesterData.length).toFixed(2)}</li>
                    </ul>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-10">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-6"
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button 
                    variant="next" 
                    size="lg" 
                    className="px-6"
                  >
                    <span>Download Report</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorForm;
