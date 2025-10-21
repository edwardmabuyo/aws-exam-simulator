const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Parse the complete AWS Reference Guide and generate comprehensive questions
 */

// Read the guide.txt file
const guidePath = path.join(__dirname, '../../AWS REFERENCE GUIDE/guide.txt');
const guideContent = fs.readFileSync(guidePath, 'utf-8');

// Parse all AWS services from the guide
function parseServices() {
  const lines = guideContent.split('\n');
  const services = [];
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect category headers (all caps)
    if (line.match(/^[A-Z\s,()]+$/) && line.length > 5 && !line.includes('TRAINING') && !line.includes('AWS Skill Builder') && !line.includes('©')) {
      // Check if it's a known category
      if (line.includes('ANALYTICS') || line.includes('APPLICATION') || line.includes('BUSINESS') || 
          line.includes('CLOUD FINANCIAL') || line.includes('COMPUTE') || line.includes('CONTAINERS') ||
          line.includes('CUSTOMER') || line.includes('DATABASE') || line.includes('DEVELOPER') ||
          line.includes('END-USER') || line.includes('FRONTEND') || line.includes('INTERNET OF THINGS') ||
          line.includes('MACHINE LEARNING') || line.includes('MANAGEMENT') || line.includes('MIGRATION') ||
          line.includes('NETWORKING') || line.includes('SECURITY') || line.includes('STORAGE')) {
        currentCategory = line.trim();
        console.log(`Found category: ${currentCategory}`);
        continue;
      }
    }
    
    // Detect service names (lines that start with "Amazon" or "AWS")
    if ((line.startsWith('Amazon ') || line.startsWith('AWS ') || line.startsWith('IAM')) && currentCategory) {
      const serviceName = line;
      // Get the description (next non-empty line)
      let description = '';
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const descLine = lines[j].trim();
        if (descLine && !descLine.startsWith('Amazon') && !descLine.startsWith('AWS') && 
            !descLine.match(/^[A-Z\s,()]+$/) && !descLine.includes('©') && 
            !descLine.includes('Explore AWS') && descLine.length > 10) {
          description = descLine;
          break;
        }
      }
      
      if (description) {
        services.push({
          name: serviceName,
          description: description,
          category: currentCategory,
          url: `https://aws.amazon.com/${serviceName.toLowerCase().replace(/\s+/g, '-').replace('aws-', '').replace('amazon-', '')}/`
        });
      }
    }
  }
  
  return services;
}

// Determine domain from category
function determineDomain(category) {
  const categoryUpper = category.toUpperCase();
  
  if (categoryUpper.includes('SECURITY') || categoryUpper.includes('IDENTITY') || categoryUpper.includes('COMPLIANCE')) {
    return 'security';
  }
  if (categoryUpper.includes('FINANCIAL') || categoryUpper.includes('BILLING') || 
      categoryUpper.includes('COST') || categoryUpper.includes('BUDGET')) {
    return 'billing';
  }
  if (categoryUpper.includes('MANAGEMENT') || categoryUpper.includes('GOVERNANCE') ||
      categoryUpper.includes('WELL-ARCHITECTED') || categoryUpper.includes('SUPPORT')) {
    return 'cloud-concepts';
  }
  
  return 'technology';
}

// Question generation templates
const templates = [
  {
    id: 'what-is',
    generate: (service) => ({
      questionText: `What is ${service.name}?`,
      type: 'definition'
    })
  },
  {
    id: 'which-service',
    generate: (service) => ({
      questionText: `Which AWS service should you use to ${service.description}?`,
      type: 'identification'
    })
  },
  {
    id: 'use-case',
    generate: (service) => ({
      questionText: `A company needs to ${service.description}. Which AWS service would be the BEST fit?`,
      type: 'use-case'
    })
  },
  {
    id: 'scenario',
    generate: (service) => {
      const scenarios = [
        `A solutions architect needs to ${service.description}. Which service should they recommend?`,
        `Which service allows you to ${service.description}?`,
        `To ${service.description}, which AWS service would you use?`
      ];
      return {
        questionText: scenarios[Math.floor(Math.random() * scenarios.length)],
        type: 'scenario'
      };
    }
  }
];

function generateOptions(service, allServices, questionType) {
  const options = [];
  
  if (questionType === 'definition') {
    // For "What is" questions, provide descriptions as options
    options.push(capitalize(service.description));
    
    // Add 3 wrong descriptions from same or similar category
    const candidates = allServices.filter(s => s.name !== service.name);
    const shuffled = shuffleArray(candidates);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(capitalize(shuffled[i].description));
    }
  } else {
    // For service identification questions, provide service names
    options.push(service.name);
    
    // Add 3 wrong services, prefer from same category
    const sameCategoryServices = allServices.filter(s => 
      s.category === service.category && s.name !== service.name
    );
    const otherServices = allServices.filter(s => 
      s.category !== service.category && s.name !== service.name
    );
    
    const candidates = [...shuffleArray(sameCategoryServices).slice(0, 2), 
                       ...shuffleArray(otherServices).slice(0, 1)];
    
    for (let i = 0; i < 3 && i < candidates.length; i++) {
      options.push(candidates[i].name);
    }
  }
  
  return shuffleArray(options);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions() {
  console.log('📖 Parsing AWS Reference Guide...\n');
  
  const services = parseServices();
  console.log(`✅ Found ${services.length} AWS services\n`);
  
  const questionsByDomain = {
    'cloud-concepts': [],
    'security': [],
    'technology': [],
    'billing': []
  };
  
  console.log('🔨 Generating questions...\n');
  
  services.forEach(service => {
    // Generate 1-2 questions per service
    const numQuestions = Math.random() > 0.5 ? 2 : 1;
    const usedTemplates = [];
    
    for (let i = 0; i < numQuestions; i++) {
      // Pick a random template we haven't used for this service
      const availableTemplates = templates.filter(t => !usedTemplates.includes(t.id));
      if (availableTemplates.length === 0) break;
      
      const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      usedTemplates.push(template.id);
      
      const { questionText, type } = template.generate(service);
      const options = generateOptions(service, services, type);
      
      const correctAnswer = type === 'definition' 
        ? capitalize(service.description)
        : service.name;
      
      const correctIndex = options.indexOf(correctAnswer);
      
      if (correctIndex === -1) {
        console.warn(`Warning: Could not find correct answer for ${service.name}`);
        continue;
      }
      
      const domain = determineDomain(service.category);
      
      const question = {
        id: uuidv4(),
        questionText: questionText,
        options: options,
        correctAnswers: [correctIndex],
        multipleAnswers: false,
        explanation: `${service.name} is an AWS service that helps you ${service.description}. This service is part of the ${service.category.toLowerCase()} category and is essential for understanding AWS cloud services in the ${domain} domain.`,
        domain: domain,
        topic: service.name,
        difficulty: 'medium',
        sourceUrl: service.url,
        sourceName: 'AWS CLF-C02 Reference Guide',
        tags: [domain, 'aws-services', service.category.toLowerCase().replace(/\s+/g, '-')],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: '1.0',
          source: 'AWS-CLF-C02-Reference-Guide',
          category: service.category
        }
      };
      
      questionsByDomain[domain].push(question);
    }
  });
  
  const totalGenerated = Object.values(questionsByDomain).reduce((sum, q) => sum + q.length, 0);
  console.log(`✅ Generated ${totalGenerated} questions from ${services.length} services\n`);
  
  // Show breakdown
  console.log('📊 Question distribution:');
  Object.entries(questionsByDomain).forEach(([domain, questions]) => {
    console.log(`   ${domain}: ${questions.length} questions`);
  });
  console.log('');
  
  return questionsByDomain;
}

function mergeWithExisting(newQuestions) {
  const dataDir = path.join(__dirname, '../data/questions');
  
  console.log('📁 Merging with existing questions...\n');
  
  let totalAdded = 0;
  
  Object.keys(newQuestions).forEach(domain => {
    const filePath = path.join(dataDir, `${domain}.json`);
    const existingQuestions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const mergedQuestions = [...existingQuestions, ...newQuestions[domain]];
    
    fs.writeFileSync(filePath, JSON.stringify(mergedQuestions, null, 2));
    console.log(`   ✅ ${domain}.json: Added ${newQuestions[domain].length} questions (${existingQuestions.length} → ${mergedQuestions.length})`);
    totalAdded += newQuestions[domain].length;
  });
  
  // Update index
  const indexPath = path.join(dataDir, 'index.json');
  const domains = ['cloud-concepts', 'security', 'technology', 'billing'];
  let totalQuestions = 0;
  const distribution = {};
  
  domains.forEach(domain => {
    const filePath = path.join(dataDir, `${domain}.json`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    distribution[domain] = questions.length;
    totalQuestions += questions.length;
  });
  
  const indexData = {
    version: '1.2',
    lastUpdated: new Date().toISOString().split('T')[0],
    totalQuestions: totalQuestions,
    domainDistribution: distribution
  };
  
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`\n   ✅ Updated index.json: ${totalQuestions} total questions`);
  console.log(`\n✨ Successfully added ${totalAdded} new questions!\n`);
}

// Main execution
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📚 AWS Reference Guide - Comprehensive Question Generator');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const newQuestions = generateQuestions();
  mergeWithExisting(newQuestions);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 Done! All services from the guide are now questions.');
  console.log('═══════════════════════════════════════════════════════\n');
}

main();

