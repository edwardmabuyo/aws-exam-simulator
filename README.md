# AWS Cloud Practitioner Exam Simulator

A comprehensive exam preparation application for the **AWS Certified Cloud Practitioner (CLF-C02)** exam, built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui.

## 🎯 Features

- ✅ **1,347 Practice Questions** - Verified questions from official AWS sources
- ✅ **3 Exam Modes** - Full Practice, Quick Practice, and Study Mode
- ✅ **Realistic Exam Simulation** - Timed exams with AWS-style interface
- ✅ **Comprehensive Scoring** - AWS-style scaled scores (100-1000) with domain breakdowns
- ✅ **Exam History** - Track your progress over time with detailed analytics
- ✅ **Detailed Review** - Filter by correct/incorrect answers for focused study
- ✅ **Beautiful UI** - Modern, responsive design with shadcn/ui components

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation & Setup

```bash
# 1. Navigate to the project directory
cd aws-exam-prep

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 📚 Usage Guide

### Taking an Exam

1. **Home Page** - Choose your exam mode:
   - **Full Practice Exam**: Realistic exam simulation with timed questions
   - **Quick Practice**: Shorter practice sessions for daily review
   - **Study Mode**: Untimed learning with immediate feedback

2. **Select Question Count** - Choose how many questions you want (5-50)

3. **Answer Questions**:
   - Click on answers to select them
   - Single choice: Radio buttons (select one)
   - Multiple choice: Checkboxes (select all that apply)
   - Use "Mark for Review" to flag questions

4. **Exam Controls**:
   - **Pause/Resume**: Take breaks during timed exams
   - **Exit**: Leave the exam (progress will be lost)
   - **Submit**: Complete the exam and view results

### Viewing Results

After completing an exam:

- **Pass/Fail Status**: See if you passed (700+ score required)
- **Detailed Scores**: View your scaled score, percentage, and domain breakdown
- **Interactive Stats**:
  - Click **"Correct Answers"** to review only correct responses
  - Click **"Incorrect Answers"** to study your mistakes
  - Click **"Review All Answers"** to see everything

### Exam History

Click **"Exam History"** button (top-right) to:
- View all past exam attempts
- See performance trends
- Track improvement over time
- Click any past exam to review it in detail

---

## 📊 Question Bank

### Total Questions: **1,347**

#### By Domain:
- **Cloud Concepts**: 269 questions (20%)
- **Security & Compliance**: 302 questions (22%)
- **Technology**: 550 questions (41%)
- **Billing & Pricing**: 226 questions (17%)

#### Sources:
- ✅ Practice exam questions from AWS-Certified-Cloud-Practitioner-Notes
- ✅ AWS CLF-C02 Reference Guide service definitions
- ✅ All questions verified and validated

---

## 🎮 Exam Modes

### 1. Full Practice Exam
- **Recommended for**: Final exam preparation
- **Questions**: 10-50 (customizable)
- **Time Limit**: 1.8 minutes per question
- **Features**: Timed, domain-weighted, complete analysis

### 2. Quick Practice
- **Recommended for**: Daily practice sessions
- **Questions**: 5-25 (customizable)
- **Time Limit**: 1.4 minutes per question
- **Features**: Faster pacing, score tracking

### 3. Study Mode
- **Recommended for**: Learning and understanding concepts
- **Questions**: 5-30 (customizable)
- **Time Limit**: Untimed
- **Features**: Immediate explanations, source references

---

## 🏗️ Project Structure

```
ExamProject/
├── aws-exam-prep/              # Main application
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── api/          # API routes
│   │   │   ├── exam/         # Exam pages
│   │   │   ├── history/      # History page
│   │   │   └── page.tsx      # Home page
│   │   ├── components/ui/    # UI components
│   │   └── lib/              # Business logic & types
│   ├── data/
│   │   ├── questions/        # Question bank (1,347 questions)
│   │   └── history/          # Exam history storage
│   ├── tests/                # Playwright E2E tests
│   └── scripts/              # Utility scripts
├── AWS-Certified-Cloud-Practitioner-Notes/
│   └── practice-exam/        # Source markdown files
├── AWS REFERENCE GUIDE/      # AWS service definitions
└── workflow/                 # Project documentation
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server (localhost:3000)

# Testing
npm test             # Run all Playwright tests
npm run test:headed  # Run tests with visible browser
npm run test:ui      # Interactive test UI
npm run test:report  # View test report

# Production
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## 🧪 Testing

The app includes comprehensive end-to-end tests using Playwright:

- ✅ Home page navigation
- ✅ Exam creation and flow
- ✅ Question answering
- ✅ Timer functionality
- ✅ Results calculation
- ✅ History tracking

Run tests with:
```bash
cd aws-exam-prep
npm test
```

---

## 🎨 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Button, Card, Dialog, Radio, Checkbox, Progress, Select)
- **Testing**: Playwright
- **Data Storage**: JSON files (server-side)
- **State Management**: React Context + Session Storage
- **Date Handling**: date-fns
- **Charts**: recharts
- **Icons**: lucide-react

---

## 📈 Key Features

### 🎯 Exam Simulation
- Realistic AWS exam interface
- Timed assessments with color-coded warnings
- Mark for review functionality
- Progress tracking
- Domain-weighted question selection
- Pause/resume capability

### 📊 Scoring System
- AWS-style scaled scoring (100-1000)
- Pass/fail determination (700 threshold)
- Domain-specific breakdowns
- Percentage calculations
- Time tracking per question

### 📚 Study Features
- Untimed study mode
- Immediate feedback
- Detailed explanations for every question
- Source URL verification
- Question-by-question review
- Filter by correct/incorrect answers

### 📈 Exam History
- Persistent storage of all attempts
- Performance statistics dashboard
- Trend analysis and insights
- Interactive exam cards for review
- Track improvement over time

### 🎨 User Experience
- Beautiful, modern UI with shadcn/ui
- Responsive design (desktop, tablet, mobile)
- Smooth animations and transitions
- Accessible components (WCAG compliant)
- Loading states and error handling

---

## 📝 Question Format

Each question includes:
```typescript
{
  id: string                    // Unique identifier
  questionText: string          // The question
  options: string[]             // Answer choices
  correctAnswers: number[]      // Indices of correct options
  multipleAnswers: boolean      // True if multiple correct
  explanation: string           // Why the answer is correct
  domain: DomainType           // cloud-concepts | security | technology | billing
  topic: string                // Specific topic (e.g., "EC2", "IAM")
  difficulty: string           // easy | medium | hard
  sourceUrl: string            // Reference link
  sourceName: string           // Source name
  tags: string[]               // Searchable tags
}
```

---

## 🎓 Exam Tips

1. **Start with Study Mode** - Learn concepts without time pressure
2. **Practice Regularly** - Use Quick Practice for daily sessions
3. **Review Mistakes** - Click "Incorrect Answers" after each exam
4. **Track Progress** - Use Exam History to see improvement
5. **Take Full Exams** - Simulate real exam conditions before test day
6. **Read Explanations** - Understand why answers are correct
7. **Focus on Weak Areas** - Review domain scores to identify gaps

---

## 🚀 Getting Started

### First Time Setup

```bash
# Clone the repository
git clone git@github.com:edwardmabuyo/aws-exam-simulator.git
cd aws-exam-simulator

# Install dependencies
cd aws-exam-prep
npm install

# Start the app
npm run dev
```

Visit **http://localhost:3000** to start practicing!

---

## 🤝 Contributing

To contribute questions:
1. Add questions to the appropriate domain file in `aws-exam-prep/data/questions/`
2. Ensure questions follow the required format
3. Include detailed explanations and source URLs
4. Validate questions are accurate and from official sources

---

## 📄 License

This is an educational project for AWS Cloud Practitioner exam preparation.
Not affiliated with Amazon Web Services (AWS).

All questions are sourced from:
- AWS Official Documentation
- AWS CLF-C02 Reference Guide
- Open-source practice materials

---

## 🐛 Troubleshooting

**App won't start?**
```bash
cd aws-exam-prep
npm install
npm run dev
```

**Tests failing?**
```bash
cd aws-exam-prep
npm install
npx playwright install
npm test
```

**Port 3000 already in use?**
- Kill the existing process or change the port in `package.json`

---

## 📞 Support

If you encounter any issues:
1. Check that Node.js 18+ is installed
2. Run `npm install` to ensure all dependencies are present
3. Clear browser cache and restart the dev server
4. Check console for error messages

---

## 🎉 What's Included

✅ **Complete Exam Simulator**
- Full-featured exam interface
- Multiple exam modes
- Realistic timer system

✅ **1,347 Verified Questions**
- All 4 exam domains covered
- Multiple choice and multiple answer support
- Detailed explanations

✅ **Exam History & Analytics**
- Track all exam attempts
- Performance trends
- Domain-specific insights

✅ **Modern UI**
- Built with Next.js 14+ and TypeScript
- shadcn/ui components
- Fully responsive design

✅ **Production Ready**
- Zero build errors
- Comprehensive testing
- Optimized performance

---

**Good luck with your AWS Cloud Practitioner certification!** 🚀☁️

---

## 📚 Additional Resources

- [AWS Certified Cloud Practitioner Official Page](https://aws.amazon.com/certification/certified-cloud-practitioner/)
- [AWS CLF-C02 Exam Guide](https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Ready to ace your exam? Start practicing now!** 🎯

