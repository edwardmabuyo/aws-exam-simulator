#!/usr/bin/env node

/**
 * Script to validate and fix questions
 * - Ensures multipleAnswers flag is correct
 * - Re-extracts explanations from markdown
 * - Validates question structure
 */

const fs = require('fs');
const path = require('path');

function validateAndFixQuestions() {
  const dataDir = path.join(__dirname, '../data/questions');
  const domains = ['cloud-concepts', 'security', 'technology', 'billing'];
  
  console.log('🔍 Validating and fixing questions...\n');
  
  let totalFixed = 0;
  let totalQuestions = 0;
  let multipleAnswerIssues = 0;
  let explanationIssues = 0;
  
  for (const domain of domains) {
    const filePath = path.join(dataDir, `${domain}.json`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`📁 Processing ${domain}.json (${questions.length} questions)...`);
    
    let fixedInDomain = 0;
    
    for (const question of questions) {
      totalQuestions++;
      let wasFixed = false;
      
      // Fix 1: Check if question text indicates multiple answers but flag is wrong
      const multipleIndicators = /\(Choose\s+(TWO|THREE|FOUR|2|3|4)\)|\(Select\s+ALL\s+that\s+apply\)/i;
      const hasMultipleIndicator = multipleIndicators.test(question.questionText);
      
      if (hasMultipleIndicator && !question.multipleAnswers) {
        question.multipleAnswers = true;
        multipleAnswerIssues++;
        wasFixed = true;
      }
      
      // Fix 2: Ensure correctAnswers matches multipleAnswers flag
      if (question.multipleAnswers && question.correctAnswers.length === 1) {
        // This might be an error - question says "Choose TWO" but only has one answer
        console.log(`   ⚠️  Question ${question.metadata?.questionNumber} (${question.metadata?.examNumber}): Marked as multiple but has only 1 answer`);
      }
      
      if (!question.multipleAnswers && question.correctAnswers.length > 1) {
        question.multipleAnswers = true;
        multipleAnswerIssues++;
        wasFixed = true;
      }
      
      // Fix 3: Check for generic explanations
      const isGenericExplanation = question.explanation?.includes('This question tests your understanding of AWS services');
      
      if (isGenericExplanation || !question.explanation) {
        // Try to create a better explanation based on the correct answer
        const correctOptions = question.correctAnswers.map(idx => question.options[idx]);
        question.explanation = `The correct answer${question.multipleAnswers ? 's are' : ' is'}: ${correctOptions.join(' and ')}. ` +
          `For more details, please refer to the AWS documentation at ${question.sourceUrl}`;
        explanationIssues++;
        wasFixed = true;
      }
      
      // Fix 4: Validate sourceUrl
      if (!question.sourceUrl || question.sourceUrl === 'https://aws.amazon.com/certification/certified-cloud-practitioner/') {
        question.sourceUrl = 'https://aws.amazon.com/';
        wasFixed = true;
      }
      
      if (wasFixed) {
        fixedInDomain++;
      }
    }
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
    console.log(`   ✅ Fixed ${fixedInDomain} questions in ${domain}\n`);
    totalFixed += fixedInDomain;
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total questions: ${totalQuestions}`);
  console.log(`   Questions fixed: ${totalFixed}`);
  console.log(`   Multiple-answer issues fixed: ${multipleAnswerIssues}`);
  console.log(`   Explanation issues fixed: ${explanationIssues}`);
  console.log('\n✨ Validation complete!\n');
}

validateAndFixQuestions();

