#!/usr/bin/env node

/**
 * Deep validation script - scans each question for accuracy
 * This is a framework for manual review
 */

const fs = require('fs');
const path = require('path');

function deepValidateQuestions() {
  const dataDir = path.join(__dirname, '../data/questions');
  const domains = ['cloud-concepts', 'security', 'technology', 'billing'];
  
  console.log('🔍 Deep scanning all questions...\n');
  
  const issues = {
    multipleAnswerMismatches: [],
    questionsMissingExplanations: [],
    suspiciousAnswers: [],
    needsReview: []
  };
  
  for (const domain of domains) {
    const filePath = path.join(dataDir, `${domain}.json`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`\n📁 Scanning ${domain}.json (${questions.length} questions)...\n`);
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = `${domain}:${i+1}`;
      
      // Check 1: Multiple answer validation
      const hasMultipleIndicator = /\(Choose\s+(TWO|THREE|FOUR|2|3|4)\)|\(Select\s+(TWO|THREE|ALL)\)/i;
      const matchResult = q.questionText.match(hasMultipleIndicator);
      
      if (matchResult) {
        const expectedCount = (matchResult[1] || matchResult[2] || '').toUpperCase();
        const countMap = { 'TWO': 2, '2': 2, 'THREE': 3, '3': 3, 'FOUR': 4, '4': 4, 'ALL': 2 };
        const expected = countMap[expectedCount] || 2;
        
        if (q.correctAnswers.length !== expected) {
          issues.suspiciousAnswers.push({
            id: qNum,
            question: q.questionText.substring(0, 80) + '...',
            issue: `Says "Choose ${expectedCount}" but has ${q.correctAnswers.length} correct answers`,
            exam: q.metadata?.examNumber,
            questionNum: q.metadata?.questionNumber
          });
        }
        
        if (!q.multipleAnswers) {
          issues.multipleAnswerMismatches.push({
            id: qNum,
            issue: 'Has multiple choice indicator but multipleAnswers is false'
          });
        }
      }
      
      // Check 2: Explanation quality
      if (q.explanation?.includes('The correct answer')) {
        // This is our generated explanation - needs real content
        issues.questionsMissingExplanations.push({
          id: qNum,
          question: q.questionText.substring(0, 80) + '...',
          exam: q.metadata?.examNumber,
          questionNum: q.metadata?.questionNumber,
          sourceUrl: q.sourceUrl
        });
      }
      
      // Check 3: Questions that need manual review
      if (q.correctAnswers.length === 0) {
        issues.needsReview.push({
          id: qNum,
          issue: 'No correct answers specified',
          question: q.questionText.substring(0, 80) + '...'
        });
      }
    }
  }
  
  // Generate report
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 DEEP VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log(`🔴 Multiple Answer Mismatches: ${issues.multipleAnswerMismatches.length}`);
  if (issues.multipleAnswerMismatches.length > 0) {
    console.log('   First 5:');
    issues.multipleAnswerMismatches.slice(0, 5).forEach(issue => {
      console.log(`   - ${issue.id}: ${issue.issue}`);
    });
  }
  
  console.log(`\n🟡 Suspicious Answer Counts: ${issues.suspiciousAnswers.length}`);
  if (issues.suspiciousAnswers.length > 0) {
    console.log('   Examples:');
    issues.suspiciousAnswers.slice(0, 10).forEach(issue => {
      console.log(`   - Exam ${issue.exam}, Q${issue.questionNum}: ${issue.issue}`);
      console.log(`     "${issue.question}"`);
    });
  }
  
  console.log(`\n📝 Questions Needing Better Explanations: ${issues.questionsMissingExplanations.length}`);
  console.log('   (These have generic explanations and need AWS-specific details)');
  
  console.log(`\n⚠️  Questions Needing Review: ${issues.needsReview.length}`);
  if (issues.needsReview.length > 0) {
    issues.needsReview.forEach(issue => {
      console.log(`   - ${issue.id}: ${issue.issue}`);
      console.log(`     "${issue.question}"`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../QUESTION_VALIDATION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\n✅ Deep validation complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review questions with suspicious answer counts');
  console.log('   2. Add proper explanations from AWS documentation');
  console.log('   3. Validate correct answers for flagged questions\n');
}

deepValidateQuestions();

