const fs = require('fs');
const path = require('path');

/**
 * Fix questions with duplicate correct answer indices
 */

function fixDuplicateAnswers() {
  const dataDir = path.join(__dirname, '../data/questions');
  const domains = ['cloud-concepts', 'security', 'technology', 'billing'];
  
  console.log('🔧 Fixing questions with duplicate correct answers...\n');
  
  let totalFixed = 0;
  
  domains.forEach(domain => {
    const filePath = path.join(dataDir, `${domain}.json`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let fixedInDomain = 0;
    
    questions.forEach((question, idx) => {
      const correctAnswers = question.correctAnswers;
      const uniqueAnswers = [...new Set(correctAnswers)].sort((a, b) => a - b);
      
      if (correctAnswers.length !== uniqueAnswers.length) {
        console.log(`Fixing ${domain} question ${idx + 1}:`);
        console.log(`  Before: [${correctAnswers.join(', ')}]`);
        console.log(`  After:  [${uniqueAnswers.join(', ')}]`);
        console.log(`  Question: ${question.questionText.substring(0, 60)}...`);
        console.log('');
        
        question.correctAnswers = uniqueAnswers;
        fixedInDomain++;
        totalFixed++;
      }
    });
    
    // Write back to file
    if (fixedInDomain > 0) {
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
      console.log(`✅ Fixed ${fixedInDomain} questions in ${domain}.json\n`);
    }
  });
  
  console.log(`\n🎉 Total fixed: ${totalFixed} questions\n`);
}

fixDuplicateAnswers();

