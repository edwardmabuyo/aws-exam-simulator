#!/usr/bin/env node

/**
 * Script to convert practice exam markdown files to JSON format
 * Usage: node scripts/convert-practice-exams.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Domain keywords to help categorize questions
const DOMAIN_KEYWORDS = {
  'cloud-concepts': [
    'cloud computing', 'cloud benefits', 'cloud economics', 'aws global infrastructure',
    'availability zone', 'region', 'edge location', 'cloudfront', 'elastic', 'scalability',
    'elasticity', 'agility', 'fault tolerance', 'high availability', 'disaster recovery',
    'shared responsibility', 'well-architected', 'design principles', 'capex', 'opex'
  ],
  'security': [
    'iam', 'identity', 'access management', 'security group', 'nacl', 'kms', 'encryption',
    'compliance', 'shield', 'waf', 'firewall', 'mfa', 'cognito', 'secrets manager',
    'cloudtrail', 'inspector', 'guardduty', 'macie', 'artifact', 'certificate manager',
    'security', 'authentication', 'authorization', 'policy', 'permission', 'role'
  ],
  'technology': [
    'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'vpc', 'elb', 'auto scaling', 'cloudformation',
    'elastic beanstalk', 'ecs', 'eks', 'fargate', 'lightsail', 'batch', 'emr', 'glue',
    'athena', 'redshift', 'kinesis', 'sns', 'sqs', 'step functions', 'api gateway',
    'route 53', 'cloudwatch', 'x-ray', 'systems manager', 'opsworks', 'codedeploy',
    'codepipeline', 'codecommit', 'codebuild', 'ebs', 'efs', 'fsx', 'storage gateway',
    'snowball', 'database migration', 'application migration', 'aurora', 'neptune',
    'documentdb', 'elasticache', 'memorydb', 'timestream', 'qldb'
  ],
  'billing': [
    'pricing', 'cost', 'billing', 'budget', 'cost explorer', 'cost allocation tags',
    'consolidated billing', 'organizations', 'savings plan', 'reserved instance',
    'spot instance', 'free tier', 'support plan', 'tco', 'calculator', 'trusted advisor',
    'cost optimization', 'aws budgets', 'cost and usage report'
  ]
};

function determineDomain(questionText, options) {
  const text = (questionText + ' ' + options.join(' ')).toLowerCase();
  
  let scores = {
    'cloud-concepts': 0,
    'security': 0,
    'technology': 0,
    'billing': 0
  };
  
  // Score based on keyword matches
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[domain] += 1;
      }
    }
  }
  
  // Return domain with highest score, default to 'technology'
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'technology';
  
  return Object.keys(scores).find(domain => scores[domain] === maxScore) || 'technology';
}

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = [];
  
  // Match each question block including the details section
  const questionPattern = /(\d+)\.\s+(.+?)(?=\n\s*-\s*A\.)([\s\S]+?)<details[^>]*>([\s\S]+?)<\/details>/g;
  const matches = [...content.matchAll(questionPattern)];
  
  let questionCounter = 0;
  
  for (const match of matches) {
    questionCounter++;
    
    const questionNumber = match[1];
    let questionText = match[2].trim();
    const optionsBlock = match[3];
    const answerBlock = match[4];
    
    // Check for multiple answers indicator
    const multipleAnswersMatch = questionText.match(/\(Choose\s+(TWO|THREE|FOUR|\d+)\)/i);
    const multipleAnswers = !!multipleAnswersMatch;
    
    // Extract options from optionsBlock
    const optionMatches = [...optionsBlock.matchAll(/-\s*([A-Z])\.\s+(.+?)(?=\n\s*-\s*[A-Z]\.|$)/gs)];
    const options = optionMatches.map(match => match[2].trim());
    const optionLetters = optionMatches.map(match => match[1]);
    
    if (options.length === 0) continue;
    
    // Extract correct answer from answerBlock (handle both "Correct answer:" and "Correct Answer:")
    const answerMatch = answerBlock.match(/Correct [Aa]nswer:\s*([A-Z,\s]+)/);
    if (!answerMatch) continue;
    
    // Handle both formats: "A, B" (with commas) and "AB" (without commas)
    const answerText = answerMatch[1].trim();
    let correctLetters;
    
    if (answerText.includes(',')) {
      // Format: "A, B" or "A,B"
      correctLetters = answerText.split(',').map(l => l.trim());
    } else {
      // Format: "AB" or "ABC" - split each character
      correctLetters = answerText.replace(/\s/g, '').split('');
    }
    
    const correctAnswers = correctLetters.map(letter => 
      optionLetters.indexOf(letter)
    ).filter(index => index !== -1);
    
    // Extract explanation and source URL if available
    let explanation = `This question tests your understanding of AWS services. Review the AWS documentation for more details.`;
    let sourceUrl = 'https://aws.amazon.com/certification/certified-cloud-practitioner/';
    
    const explanationMatch = answerBlock.match(/Explanation:\s*(.+?)$/s);
    if (explanationMatch) {
      const explanationText = explanationMatch[1].trim();
      // Extract URL if present
      const urlMatch = explanationText.match(/<(.+?)>/);
      if (urlMatch) {
        sourceUrl = urlMatch[1];
        // Clean explanation text (remove URL)
        explanation = explanationText.replace(/<.+?>/, '').trim() || explanation;
      } else {
        explanation = explanationText;
      }
    }
    
    // Determine domain
    const domain = determineDomain(questionText, options);
    
    // Extract topic from question (simplified)
    let topic = 'AWS Services';
    for (const [domainName, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      for (const keyword of keywords) {
        if (questionText.toLowerCase().includes(keyword)) {
          topic = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
    }
    
    questions.push({
      id: uuidv4(),
      questionText: questionText,
      options: options,
      correctAnswers: correctAnswers,
      multipleAnswers: multipleAnswers,
      explanation: explanation,
      domain: domain,
      topic: topic,
      difficulty: 'medium',
      sourceUrl: sourceUrl,
      sourceName: 'AWS Documentation',
      tags: [domain, topic.toLowerCase()],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
        examNumber: path.basename(filePath, '.md').replace('practice-exam-', ''),
        questionNumber: String(questionCounter)
      }
    });
  }
  
  return questions;
}

function main() {
  const practiceExamDir = path.join(__dirname, '../../AWS-Certified-Cloud-Practitioner-Notes/practice-exam');
  const outputDir = path.join(__dirname, '../data/questions');
  
  console.log('🔄 Converting practice exam markdown files to JSON...\n');
  
  // Read all practice exam files
  const files = fs.readdirSync(practiceExamDir)
    .filter(f => f.startsWith('practice-exam-') && f.endsWith('.md'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
  
  console.log(`📁 Found ${files.length} practice exam files\n`);
  
  let allQuestions = [];
  
  for (const file of files) {
    const filePath = path.join(practiceExamDir, file);
    console.log(`   Processing: ${file}...`);
    
    try {
      const questions = parseMarkdownFile(filePath);
      allQuestions = allQuestions.concat(questions);
      console.log(`   ✅ Extracted ${questions.length} questions`);
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total questions extracted: ${allQuestions.length}\n`);
  
  // Group by domain
  const questionsByDomain = {
    'cloud-concepts': [],
    'security': [],
    'technology': [],
    'billing': []
  };
  
  for (const question of allQuestions) {
    questionsByDomain[question.domain].push(question);
  }
  
  // Show distribution
  console.log('📈 Domain distribution:');
  for (const [domain, questions] of Object.entries(questionsByDomain)) {
    console.log(`   ${domain}: ${questions.length} questions`);
  }
  
  // Write to JSON files
  console.log('\n💾 Writing JSON files...\n');
  
  for (const [domain, questions] of Object.entries(questionsByDomain)) {
    const outputFile = path.join(outputDir, `${domain}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2));
    console.log(`   ✅ ${outputFile} (${questions.length} questions)`);
  }
  
  // Update index.json
  const indexData = {
    version: '2.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalQuestions: allQuestions.length,
    domainDistribution: {
      'cloud-concepts': questionsByDomain['cloud-concepts'].length,
      'security': questionsByDomain['security'].length,
      'technology': questionsByDomain['technology'].length,
      'billing': questionsByDomain['billing'].length
    }
  };
  
  const indexFile = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
  console.log(`   ✅ ${indexFile}\n`);
  
  console.log('✨ Conversion complete!\n');
  console.log(`📝 Summary:`);
  console.log(`   - Total questions: ${allQuestions.length}`);
  console.log(`   - Cloud Concepts: ${questionsByDomain['cloud-concepts'].length}`);
  console.log(`   - Security: ${questionsByDomain['security'].length}`);
  console.log(`   - Technology: ${questionsByDomain['technology'].length}`);
  console.log(`   - Billing: ${questionsByDomain['billing'].length}`);
  console.log('\n🎉 Ready to use in your exam app!');
}

main();

