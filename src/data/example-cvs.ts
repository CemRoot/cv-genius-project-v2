import { CVData } from '@/types/cv'

export interface ExampleCVCategory {
  id: string
  title: string
  description: string
  icon: string
  examples: ExampleCV[]
}

export interface ExampleCV {
  id: string
  name: string
  role: string
  level: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive'
  industry: string
  description: string
  cvData: CVData
}

export const EXAMPLE_CV_CATEGORIES: ExampleCVCategory[] = [
  {
    id: 'technology',
    title: 'Technology & Software',
    description: 'Software developers, engineers, and tech professionals',
    icon: '💻',
    examples: [
      {
        id: 'software-engineer-senior',
        name: 'Sarah O\'Connor',
        role: 'Senior Software Engineer',
        level: 'Senior Level',
        industry: 'Technology',
        description: 'Experienced full-stack developer with 8+ years in fintech',
        cvData: {
          id: 'example-1',
          personal: {
            fullName: 'Sarah O\'Connor',
            title: 'Senior Software Engineer',
            email: 'sarah.oconnor@email.com',
            phone: '+353 87 123 4567',
            address: 'Dublin 2, Ireland',
            linkedin: 'https://www.linkedin.com/in/sarah-oconnor-dev',
            website: 'https://sarahoconnor.dev',
            summary: 'Senior Software Engineer with 8+ years of experience building scalable web applications for fintech companies. Expertise in React, Node.js, and cloud infrastructure. Led development teams of up to 8 engineers and delivered products serving 100K+ users. Passionate about clean code, mentoring junior developers, and driving technical innovation.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Skills', visible: true, order: 5 },
            { id: '6', type: 'projects', title: 'Projects', visible: true, order: 6 },
            { id: '7', type: 'certifications', title: 'Certifications', visible: true, order: 7 }
          ],
          experience: [
            {
              id: '1',
              company: 'Stripe',
              position: 'Senior Software Engineer',
              location: 'Dublin, Ireland',
              startDate: '2021-03',
              endDate: 'Present',
              current: true,
              description: 'Lead development of payment processing microservices handling €50M+ monthly transactions. Built React-based dashboard for merchant analytics, improving user engagement by 40%. Mentored 4 junior engineers and established code review best practices. Technologies: React, TypeScript, Node.js, PostgreSQL, AWS.',
              achievements: ['Led payment processing microservices handling €50M+ monthly transactions', 'Built React dashboard improving user engagement by 40%', 'Mentored 4 junior engineers and established code review best practices']
            },
            {
              id: '2',
              company: 'Revolut',
              position: 'Software Engineer',
              location: 'Dublin, Ireland',
              startDate: '2019-06',
              endDate: '2021-02',
              current: false,
              description: 'Developed core banking features for mobile app used by 15M+ customers. Implemented real-time transaction notifications system reducing customer support queries by 25%. Collaborated with product and design teams in agile environment. Technologies: React Native, Python, Kafka, Redis.',
              achievements: ['Developed core banking features for 15M+ mobile app users', 'Reduced customer support queries by 25% with real-time notifications', 'Collaborated with product and design teams in agile environment']
            },
            {
              id: '3',
              company: 'Accenture',
              position: 'Junior Software Developer',
              location: 'Dublin, Ireland',
              startDate: '2017-09',
              endDate: '2019-05',
              current: false,
              description: 'Built custom web applications for enterprise clients in banking and insurance sectors. Participated in full software development lifecycle from requirements gathering to deployment. Gained experience in multiple technologies and agile methodologies.',
              achievements: ['Built custom web applications for banking and insurance enterprise clients', 'Participated in full SDLC from requirements gathering to deployment', 'Gained experience in multiple technologies and agile methodologies']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Trinity College Dublin',
              degree: 'Bachelor of Arts (Honours)',
              field: 'Computer Science',
              location: 'Dublin, Ireland',
              startDate: '2013-09',
              endDate: '2017-06',
              current: false,
              grade: 'First Class Honours',
              description: 'Relevant modules: Software Engineering, Data Structures & Algorithms, Database Systems, Web Development. Final year project: Built machine learning system for fraud detection achieving 94% accuracy.'
            }
          ],
          skills: [
            { id: '1', name: 'JavaScript/TypeScript', level: 'Expert', category: 'Technical' },
            { id: '2', name: 'React/Next.js', level: 'Expert', category: 'Technical' },
            { id: '3', name: 'Node.js/Express', level: 'Advanced', category: 'Technical' },
            { id: '4', name: 'Python', level: 'Advanced', category: 'Technical' },
            { id: '5', name: 'PostgreSQL/MongoDB', level: 'Advanced', category: 'Technical' },
            { id: '6', name: 'AWS/Docker', level: 'Intermediate', category: 'Technical' },
            { id: '7', name: 'Team Leadership', level: 'Advanced', category: 'Soft' },
            { id: '8', name: 'Agile/Scrum', level: 'Advanced', category: 'Other' }
          ],
          projects: [
            {
              id: '1',
              name: 'FinanceTracker Pro',
              description: 'Personal finance management app with real-time expense tracking and AI-powered insights. Built with React Native and Node.js backend.',
              technologies: ['React Native', 'Node.js', 'PostgreSQL', 'Chart.js'],
              url: 'https://github.com/sarah/finance-tracker',
              startDate: '2023-01',
              endDate: '2023-06',
              current: false,
              achievements: ['Featured on Product Hunt with 500+ upvotes', 'Integrated with 3 major Irish banks via Open Banking APIs', 'Achieved 4.8/5 rating on App Store with 200+ reviews']
            },
            {
              id: '2',
              name: 'Dublin Tech Jobs API',
              description: 'Open source API aggregating tech job listings from major Dublin companies. Serves 1000+ daily requests.',
              technologies: ['Python', 'FastAPI', 'Redis', 'Docker'],
              url: 'https://github.com/sarah/dublin-tech-jobs',
              startDate: '2022-08',
              endDate: '2022-12',
              current: false,
              achievements: ['Aggregates 500+ new job listings daily from 50+ companies', 'Open sourced with 200+ GitHub stars', 'Used by 5+ Irish job search platforms']
            }
          ],
          certifications: [
            {
              id: '1',
              name: 'AWS Certified Solutions Architect',
              issuer: 'Amazon Web Services',
              issueDate: '2023-03',
              expiryDate: '2026-03',
              credentialId: 'AWS-SA-2023-001'
            },
            {
              id: '2',
              name: 'Certified Scrum Master',
              issuer: 'Scrum Alliance',
              issueDate: '2022-11',
              expiryDate: '2024-11',
              credentialId: 'CSM-2022-456'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Conversational', certification: '' },
            { id: '3', name: 'Spanish', level: 'Conversational', certification: 'DELE B2' }
          ],
          interests: [
            { id: '1', name: 'Open Source Contributions', description: 'Active contributor to React and Node.js ecosystems' },
            { id: '2', name: 'Tech Meetups', description: 'Regular speaker at Dublin.js and React Dublin meetups' },
            { id: '3', name: 'Rock Climbing', description: 'Weekend climbing adventures around Ireland' }
          ],
          references: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      },
      {
        id: 'php-developer-mid',
        name: 'Liam Murphy',
        role: 'PHP Developer',
        level: 'Mid Level',
        industry: 'Technology',
        description: 'Mid-level PHP developer with 4+ years experience in e-commerce',
        cvData: {
          id: 'example-2',
          personal: {
            fullName: 'Liam Murphy',
            title: 'PHP Developer',
            email: 'liam.murphy@email.com',
            phone: '+353 86 987 6543',
            address: 'Dublin 8, Ireland',
            linkedin: 'https://www.linkedin.com/in/liam-murphy-php',
            website: 'https://liammurphy.dev',
            summary: 'Passionate PHP Developer with 4+ years of experience building robust e-commerce platforms and web applications. Skilled in Laravel, Symfony, and modern PHP practices. Experience with MySQL optimization, API development, and agile development processes. Strong problem-solving abilities and commitment to writing clean, maintainable code.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Technical Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Certifications', visible: true, order: 6 }
          ],
          experience: [
            {
              id: '1',
              company: 'ShopIrish.ie',
              position: 'PHP Developer',
              location: 'Dublin, Ireland',
              startDate: '2022-01',
              endDate: 'Present',
              current: true,
              description: 'Develop and maintain e-commerce platform serving 50,000+ customers. Built custom payment integration with Irish banks reducing transaction fees by 15%. Optimized database queries improving page load speeds by 35%. Collaborate with UX team to implement responsive designs.',
              achievements: ['Reduced payment processing fees by 15% through custom banking integrations', 'Improved site performance by 35% through database optimization', 'Led implementation of responsive design serving 50,000+ customers']
            },
            {
              id: '2',
              company: 'WebCraft Solutions',
              position: 'Junior PHP Developer',
              location: 'Dublin, Ireland',
              startDate: '2020-06',
              endDate: '2021-12',
              current: false,
              description: 'Developed custom CMS solutions for Irish SMEs. Built RESTful APIs for mobile app integrations. Participated in code reviews and maintained legacy PHP applications. Gained experience with Laravel framework and MySQL optimization.',
              achievements: ['Delivered 12+ custom CMS solutions for Irish SMEs', 'Built 5+ RESTful APIs for mobile app integrations', 'Maintained 20+ legacy PHP applications with 99% uptime']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Dublin Institute of Technology',
              degree: 'Higher Diploma in Computing',
              field: 'Computer Science',
              location: 'Dublin, Ireland',
              startDate: '2019-09',
              endDate: '2020-05',
              current: false,
              grade: 'Distinction',
              description: 'Intensive one-year conversion course covering programming fundamentals, web development, and software engineering principles.'
            },
            {
              id: '2',
              institution: 'University College Dublin',
              degree: 'Bachelor of Commerce',
              field: 'Business Studies',
              location: 'Dublin, Ireland',
              startDate: '2015-09',
              endDate: '2019-06',
              current: false,
              grade: '2:1 Honours',
              description: 'Business studies with modules in information systems and data analysis.'
            }
          ],
          skills: [
            { id: '1', name: 'PHP', level: 'Advanced', category: 'Technical' },
            { id: '2', name: 'Laravel', level: 'Advanced', category: 'Software' },
            { id: '3', name: 'Symfony', level: 'Intermediate', category: 'Software' },
            { id: '4', name: 'MySQL', level: 'Advanced', category: 'Technical' },
            { id: '5', name: 'JavaScript/jQuery', level: 'Intermediate', category: 'Technical' },
            { id: '6', name: 'HTML/CSS', level: 'Advanced', category: 'Technical' },
            { id: '7', name: 'Git/GitHub', level: 'Advanced', category: 'Other' },
            { id: '8', name: 'REST APIs', level: 'Advanced', category: 'Technical' }
          ],
          certifications: [
            {
              id: '1',
              name: 'Laravel Certified Developer',
              issuer: 'Laravel',
              issueDate: '2023-01',
              expiryDate: '',
              credentialId: 'LARAVEL-2023-789'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Basic', certification: '' }
          ],
          interests: [
            { id: '1', name: 'Web Development Trends', description: 'Following latest PHP and web development technologies' },
            { id: '2', name: 'Football', description: 'Playing for local Dublin league team' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Medical',
    description: 'Doctors, nurses, therapists, and healthcare professionals',
    icon: '🏥',
    examples: [
      {
        id: 'nutritionist-mid',
        name: 'Dr. Emma Walsh',
        role: 'Clinical Nutritionist',
        level: 'Mid Level',
        industry: 'Healthcare',
        description: 'Registered nutritionist specializing in sports nutrition and metabolic health',
        cvData: {
          id: 'example-3',
          personal: {
            fullName: 'Dr. Emma Walsh',
            title: 'Clinical Nutritionist & Dietitian',
            email: 'emma.walsh@nutrition.ie',
            phone: '+353 85 456 7890',
            address: 'Dublin 4, Ireland',
            linkedin: 'https://www.linkedin.com/in/emma-walsh-nutritionist',
            website: 'https://emmawalshnutrition.ie',
            summary: 'Registered Clinical Nutritionist with 6+ years of experience in sports nutrition, weight management, and metabolic health. Specialized in evidence-based nutrition interventions for athletes and chronic disease management. Published researcher with expertise in nutritional biochemistry and behavior change strategies. Committed to improving health outcomes through personalized nutrition care.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Professional Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education & Qualifications', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Professional Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Professional Registrations', visible: true, order: 6 },
            { id: '7', type: 'interests', title: 'Professional Interests', visible: true, order: 7 }
          ],
          experience: [
            {
              id: '1',
              company: 'Performance Nutrition Clinic',
              position: 'Senior Clinical Nutritionist',
              location: 'Dublin, Ireland',
              startDate: '2021-08',
              endDate: 'Present',
              current: true,
              description: 'Provide specialized nutrition counseling for elite athletes and sports teams including Leinster Rugby. Develop evidence-based nutrition protocols improving athletic performance by average 12%. Conduct metabolic testing and body composition analysis. Supervise junior nutritionists and nutrition students.',
              achievements: ['Improved athletic performance by 12% through evidence-based nutrition protocols', 'Provided nutrition counseling to Leinster Rugby and 50+ elite athletes', 'Supervised 8+ junior nutritionists and nutrition students']
            },
            {
              id: '2',
              company: 'St. Vincent\'s Hospital',
              position: 'Clinical Dietitian',
              location: 'Dublin, Ireland',
              startDate: '2019-02',
              endDate: '2021-07',
              current: false,
              description: 'Provided medical nutrition therapy for patients with diabetes, cardiovascular disease, and gastrointestinal disorders. Collaborated with multidisciplinary team to optimize patient outcomes. Conducted nutrition education sessions for patients and families. Maintained detailed clinical documentation and care plans.',
              achievements: ['Provided medical nutrition therapy to 200+ patients with chronic conditions', 'Conducted 100+ nutrition education sessions for patients and families', 'Collaborated with multidisciplinary teams to improve patient outcomes by 25%']
            },
            {
              id: '3',
              company: 'Nutrition Works Ireland',
              position: 'Community Nutritionist',
              location: 'Dublin, Ireland',
              startDate: '2018-06',
              endDate: '2019-01',
              current: false,
              description: 'Delivered community nutrition programs focused on obesity prevention and healthy lifestyle promotion. Conducted group workshops and individual consultations. Developed educational materials and social media content for health promotion campaigns.',
              achievements: ['Delivered nutrition programs to 500+ community members', 'Conducted 50+ group workshops on healthy lifestyle promotion', 'Developed educational materials used by 3 health promotion campaigns']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'University College Dublin',
              degree: 'PhD in Nutritional Sciences',
              field: 'Nutritional Sciences',
              location: 'Dublin, Ireland',
              startDate: '2014-09',
              endDate: '2018-05',
              current: false,
              grade: 'Distinction',
              description: 'Thesis: "Impact of Personalized Nutrition Interventions on Metabolic Health Markers in Irish Adults". Published 8 peer-reviewed papers in international journals.'
            },
            {
              id: '2',
              institution: 'Trinity College Dublin',
              degree: 'MSc Human Nutrition',
              field: 'Human Nutrition',
              location: 'Dublin, Ireland',
              startDate: '2012-09',
              endDate: '2014-06',
              current: false,
              grade: 'First Class Honours',
              description: 'Specialized in clinical nutrition and nutritional biochemistry. Dissertation on sports nutrition for endurance athletes.'
            },
            {
              id: '3',
              institution: 'University College Cork',
              degree: 'BSc Biological Sciences',
              field: 'Biological Sciences',
              location: 'Cork, Ireland',
              startDate: '2008-09',
              endDate: '2012-06',
              current: false,
              grade: 'First Class Honours',
              description: 'Major in biochemistry and physiology with focus on human metabolism.'
            }
          ],
          skills: [
            { id: '1', name: 'Clinical Nutrition Assessment', level: 'Expert', category: 'Technical' },
            { id: '2', name: 'Sports Nutrition', level: 'Expert', category: 'Technical' },
            { id: '3', name: 'Metabolic Testing', level: 'Advanced', category: 'Technical' },
            { id: '4', name: 'Nutrition Counseling', level: 'Expert', category: 'Soft' },
            { id: '5', name: 'Research & Analysis', level: 'Advanced', category: 'Technical' },
            { id: '6', name: 'Medical Nutrition Therapy', level: 'Advanced', category: 'Technical' },
            { id: '7', name: 'Body Composition Analysis', level: 'Advanced', category: 'Technical' },
            { id: '8', name: 'Program Development', level: 'Advanced', category: 'Other' }
          ],
          certifications: [
            {
              id: '1',
              name: 'Registered Nutritionist (RNutr)',
              issuer: 'Association for Nutrition (AfN)',
              issueDate: '2018-07',
              expiryDate: '2024-07',
              credentialId: 'RNutr-2018-0234'
            },
            {
              id: '2',
              name: 'CORU Registered Dietitian',
              issuer: 'Health and Social Care Professionals Council',
              issueDate: '2018-06',
              expiryDate: '2024-06',
              credentialId: 'CORU-RD-5678'
            },
            {
              id: '3',
              name: 'Certified Sports Nutritionist',
              issuer: 'International Society for Sports Nutrition',
              issueDate: '2020-03',
              expiryDate: '2025-03',
              credentialId: 'CISSN-2020-891'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Conversational', certification: 'Leaving Certificate Higher Level' },
            { id: '3', name: 'French', level: 'Professional', certification: 'DELF B2' }
          ],
          interests: [
            { id: '1', name: 'Nutrition Research', description: 'Contributing to evidence-based nutrition practice through research' },
            { id: '2', name: 'Endurance Sports', description: 'Marathon running and triathlon training' },
            { id: '3', name: 'Sustainable Food Systems', description: 'Promoting environmentally sustainable nutrition practices' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      }
    ]
  },
  {
    id: 'education',
    title: 'Education & Childcare',
    description: 'Teachers, educators, and childcare professionals',
    icon: '🎓',
    examples: [
      {
        id: 'primary-teacher-senior',
        name: 'Aoife O\'Brien',
        role: 'Primary School Teacher',
        level: 'Senior Level',
        industry: 'Education',
        description: 'Experienced primary teacher with 12+ years in Irish education system',
        cvData: {
          id: 'example-4',
          personal: {
            fullName: 'Aoife O\'Brien',
            title: 'Primary School Teacher',
            email: 'aoife.obrien@education.ie',
            phone: '+353 87 234 5678',
            address: 'Dublin 15, Ireland',
            linkedin: 'https://www.linkedin.com/in/aoife-obrien-teacher',
            website: '',
            summary: 'Dedicated Primary School Teacher with 12+ years of experience in the Irish education system. Specialist in inclusive education and STEM integration with proven track record of improving student outcomes. Experienced in curriculum development, assessment strategies, and supporting children with diverse learning needs. Passionate about fostering creativity and critical thinking in young learners.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Teaching Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education & Qualifications', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Teaching Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Professional Development', visible: true, order: 6 },
            { id: '7', type: 'interests', title: 'Professional Interests', visible: true, order: 7 }
          ],
          experience: [
            {
              id: '1',
              company: 'St. Patrick\'s National School',
              position: 'Senior Teacher & STEM Coordinator',
              location: 'Dublin 15, Ireland',
              startDate: '2018-09',
              endDate: 'Present',
              current: true,
              description: 'Lead teacher for 6th class with 28 students. Coordinate school-wide STEM program reaching 240+ students. Developed innovative project-based learning approaches increasing student engagement by 40%. Mentor newly qualified teachers and coordinate parent-teacher communications. Member of school leadership team.',
              achievements: ['Increased student engagement by 40% through project-based learning approaches', 'Coordinated STEM program reaching 240+ students across 8 classes', 'Mentored 6+ newly qualified teachers with 100% retention rate']
            },
            {
              id: '2',
              company: 'Scoil Mhuire National School',
              position: 'Primary School Teacher',
              location: 'Dublin 12, Ireland',
              startDate: '2014-09',
              endDate: '2018-08',
              current: false,
              description: 'Taught multi-grade classes (3rd and 4th) in DEIS school setting. Implemented differentiated learning strategies for diverse student population. Coordinated after-school homework club supporting 30+ students. Collaborated with SET teachers to support students with additional needs.',
              achievements: ['Improved literacy scores by 25% in DEIS setting through differentiated strategies', 'Coordinated homework club supporting 30+ students with 95% attendance', 'Collaborated with SET teachers to support 15+ students with additional needs']
            },
            {
              id: '3',
              company: 'Gaelscoil Sheoirse',
              position: 'Primary School Teacher',
              location: 'Dublin 8, Ireland',
              startDate: '2012-09',
              endDate: '2014-08',
              current: false,
              description: 'Taught through Irish medium in immersion environment. Developed bilingual learning resources and assessment materials. Supported students transitioning to Irish-medium education. Participated in Irish language professional development programs.',
              achievements: ['Developed 20+ bilingual learning resources used school-wide', 'Supported 25+ students transitioning to Irish-medium education', 'Achieved 90% Irish language proficiency rate in class assessments']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Mary Immaculate College',
              degree: 'Bachelor of Education (Primary Teaching)',
              field: 'Primary Teaching',
              location: 'Limerick, Ireland',
              startDate: '2008-09',
              endDate: '2012-06',
              current: false,
              grade: 'First Class Honours',
              description: 'Four-year concurrent degree program. Teaching placements in urban and rural settings. Specialization in Mathematics and Science education. Thesis on inclusive education practices.'
            },
            {
              id: '2',
              institution: 'Trinity College Dublin',
              degree: 'Master of Education (Inclusive Education)',
              field: 'Inclusive Education',
              location: 'Dublin, Ireland',
              startDate: '2016-09',
              endDate: '2018-06',
              current: false,
              grade: 'Distinction',
              description: 'Part-time program focusing on supporting students with diverse learning needs. Research project on technology integration for students with learning difficulties.'
            }
          ],
          skills: [
            { id: '1', name: 'Curriculum Planning & Delivery', level: 'Expert', category: 'Technical' },
            { id: '2', name: 'Inclusive Education', level: 'Expert', category: 'Technical' },
            { id: '3', name: 'STEM Education', level: 'Advanced', category: 'Technical' },
            { id: '4', name: 'Assessment & Evaluation', level: 'Advanced', category: 'Technical' },
            { id: '5', name: 'Classroom Management', level: 'Expert', category: 'Soft' },
            { id: '6', name: 'Technology Integration', level: 'Advanced', category: 'Technical' },
            { id: '7', name: 'Irish Language Teaching', level: 'Advanced', category: 'Technical' },
            { id: '8', name: 'Parent Communication', level: 'Expert', category: 'Soft' }
          ],
          certifications: [
            {
              id: '1',
              name: 'Teaching Council Registration',
              issuer: 'Teaching Council of Ireland',
              issueDate: '2012-09',
              expiryDate: '',
              credentialId: 'TC-REG-67890'
            },
            {
              id: '2',
              name: 'Children First Training',
              issuer: 'Tusla',
              issueDate: '2023-01',
              expiryDate: '2026-01',
              credentialId: 'CF-2023-456'
            },
            {
              id: '3',
              name: 'Google for Education Certified Trainer',
              issuer: 'Google',
              issueDate: '2022-05',
              expiryDate: '2024-05',
              credentialId: 'GFECT-2022-789'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Fluent', certification: 'Leaving Certificate Higher Level A1' },
            { id: '3', name: 'French', level: 'Basic', certification: 'Leaving Certificate Ordinary Level' }
          ],
          interests: [
            { id: '1', name: 'Educational Technology', description: 'Exploring innovative ways to integrate technology in primary education' },
            { id: '2', name: 'Irish Traditional Music', description: 'Playing fiddle and teaching céilí dancing to students' },
            { id: '3', name: 'Environmental Education', description: 'Promoting sustainability awareness through school garden project' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      },
      {
        id: 'childcare-worker-entry',
        name: 'Niamh Kelly',
        role: 'Childcare Worker',
        level: 'Entry Level',
        industry: 'Education',
        description: 'Enthusiastic childcare worker with 2+ years experience in early years education',
        cvData: {
          id: 'example-5',
          personal: {
            fullName: 'Niamh Kelly',
            title: 'Early Years Educator',
            email: 'niamh.kelly@childcare.ie',
            phone: '+353 86 345 6789',
            address: 'Dublin 14, Ireland',
            linkedin: 'https://www.linkedin.com/in/niamh-kelly-childcare',
            website: '',
            summary: 'Passionate Early Years Educator with 2+ years of experience working with children aged 0-6 years. Qualified in Early Childhood Care and Education with strong foundation in child development, play-based learning, and family support. Committed to creating safe, nurturing environments where children can thrive and develop to their full potential.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education & Training', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Professional Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Certifications', visible: true, order: 6 }
          ],
          experience: [
            {
              id: '1',
              company: 'Little Learners Childcare Centre',
              position: 'Early Years Educator',
              location: 'Dublin 14, Ireland',
              startDate: '2022-09',
              endDate: 'Present',
              current: true,
              description: 'Care for and educate children aged 2-4 years in room of 12 children. Plan and implement age-appropriate activities following Síolta and Aistear frameworks. Maintain observation records and learning portfolios for each child. Communicate daily with parents about child\'s progress and wellbeing.',
              achievements: ['Implemented Síolta and Aistear frameworks for 12 children aged 2-4', 'Maintained detailed learning portfolios achieving 100% parent satisfaction', 'Developed 50+ age-appropriate activities enhancing child development']
            },
            {
              id: '2',
              company: 'Happy Days Montessori',
              position: 'Assistant Early Years Practitioner',
              location: 'Dublin 16, Ireland',
              startDate: '2021-06',
              endDate: '2022-08',
              current: false,
              description: 'Assisted lead educator in pre-school room with 15 children aged 3-5 years. Supported implementation of Montessori method and prepared learning materials. Supervised children during outdoor play and meal times. Participated in staff meetings and professional development training.',
              achievements: ['Supported Montessori method implementation for 15 children aged 3-5', 'Prepared 30+ learning materials enhancing sensory development', 'Achieved 98% child safety record during outdoor supervision']
            },
            {
              id: '3',
              company: 'Various Families',
              position: 'Babysitter/Childminder',
              location: 'Dublin, Ireland',
              startDate: '2019-09',
              endDate: '2021-05',
              current: false,
              description: 'Provided reliable childcare services for multiple families with children aged 6 months to 10 years. Developed strong relationships with children and parents through consistent, quality care. Planned engaging activities and supported homework completion for school-age children.',
              achievements: ['Provided childcare for 8+ families with 100% client retention', 'Supported homework completion with 95% improvement in grades', 'Developed strong relationships through consistent quality care']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Marino Institute of Education',
              degree: 'Level 6 Certificate in Early Childhood Care and Education',
              field: 'Early Childhood Care and Education',
              location: 'Dublin, Ireland',
              startDate: '2020-09',
              endDate: '2022-05',
              current: false,
              grade: 'Distinction',
              description: 'Comprehensive two-year program covering child development, curriculum frameworks, health & safety, and family support. Completed 300 hours of work placement in various early years settings.'
            },
            {
              id: '2',
              institution: 'St. Mary\'s Secondary School',
              degree: 'Leaving Certificate',
              field: 'Secondary Education',
              location: 'Dublin, Ireland',
              startDate: '2014-09',
              endDate: '2020-06',
              current: false,
              grade: '420 points',
              description: 'Subjects: English, Irish, Mathematics, Biology, Art, Geography, LCVP. Active member of school choir and drama society.'
            }
          ],
          skills: [
            { id: '1', name: 'Child Development Knowledge', level: 'Advanced', category: 'Technical' },
            { id: '2', name: 'Activity Planning', level: 'Advanced', category: 'Technical' },
            { id: '3', name: 'Observation & Assessment', level: 'Intermediate', category: 'Technical' },
            { id: '4', name: 'Behaviour Management', level: 'Advanced', category: 'Soft' },
            { id: '5', name: 'Health & Safety', level: 'Advanced', category: 'Technical' },
            { id: '6', name: 'Parent Communication', level: 'Advanced', category: 'Soft' },
            { id: '7', name: 'First Aid', level: 'Intermediate', category: 'Technical' },
            { id: '8', name: 'Arts & Crafts', level: 'Advanced', category: 'Other' }
          ],
          certifications: [
            {
              id: '1',
              name: 'QQI Level 6 Early Childhood Care and Education',
              issuer: 'Quality and Qualifications Ireland',
              issueDate: '2022-05',
              expiryDate: '',
              credentialId: 'QQI-6-2022-345'
            },
            {
              id: '2',
              name: 'Garda Vetting',
              issuer: 'An Garda Síochána',
              issueDate: '2023-08',
              expiryDate: '2026-08',
              credentialId: 'GV-2023-789'
            },
            {
              id: '3',
              name: 'First Aid Response',
              issuer: 'Irish Red Cross',
              issueDate: '2023-03',
              expiryDate: '2026-03',
              credentialId: 'FAR-2023-456'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Professional', certification: 'Leaving Certificate Higher Level B2' }
          ],
          interests: [
            { id: '1', name: 'Children\'s Literature', description: 'Reading and recommending age-appropriate books' },
            { id: '2', name: 'Art & Craft Activities', description: 'Creating engaging sensory and creative experiences' },
            { id: '3', name: 'Outdoor Education', description: 'Promoting nature-based learning and physical activity' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      }
    ]
  },
  {
    id: 'business',
    title: 'Business & Finance',
    description: 'Managers, analysts, consultants, and finance professionals',
    icon: '💼',
    examples: [
      {
        id: 'business-analyst-mid',
        name: 'David Chen',
        role: 'Business Analyst',
        level: 'Mid Level',
        industry: 'Finance',
        description: 'Data-driven business analyst with 5+ years in financial services',
        cvData: {
          id: 'example-6',
          personal: {
            fullName: 'David Chen',
            title: 'Senior Business Analyst',
            email: 'david.chen@business.ie',
            phone: '+353 87 567 8901',
            address: 'Dublin 2, Ireland',
            linkedin: 'https://www.linkedin.com/in/david-chen-analyst',
            website: '',
            summary: 'Results-driven Senior Business Analyst with 5+ years of experience in financial services and fintech. Expertise in data analysis, process optimization, and stakeholder management. Proven track record of delivering insights that drive business growth and operational efficiency. Skilled in SQL, Python, and business intelligence tools with strong presentation and communication abilities.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Professional Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Technical Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Certifications', visible: true, order: 6 }
          ],
          experience: [
            {
              id: '1',
              company: 'AIB (Allied Irish Banks)',
              position: 'Senior Business Analyst',
              location: 'Dublin, Ireland',
              startDate: '2021-03',
              endDate: 'Present',
              current: true,
              description: 'Lead analysis of customer data to identify trends and opportunities, resulting in 15% increase in customer retention. Develop automated reporting dashboards using Power BI reducing manual reporting time by 60%. Collaborate with IT teams to implement data warehouse solutions. Present findings to C-level executives and recommend strategic initiatives.',
              achievements: ['Increased customer retention by 15% through data-driven insights', 'Reduced manual reporting time by 60% with automated Power BI dashboards', 'Presented findings to C-level executives leading to 3 strategic initiatives']
            },
            {
              id: '2',
              company: 'Revolut',
              position: 'Business Analyst',
              location: 'Dublin, Ireland',
              startDate: '2019-08',
              endDate: '2021-02',
              current: false,
              description: 'Analyzed user behavior and transaction patterns for mobile banking platform with 15M+ users. Built predictive models to identify customer churn risk, improving retention strategies. Conducted A/B testing for new features resulting in 20% improvement in user engagement. Supported product team with data-driven insights for feature prioritization.',
              achievements: ['Analyzed user behavior for 15M+ users on mobile banking platform', 'Built predictive models improving customer retention strategies by 20%', 'Conducted A/B testing resulting in 20% improvement in user engagement']
            },
            {
              id: '3',
              company: 'Deloitte Ireland',
              position: 'Junior Business Analyst',
              location: 'Dublin, Ireland',
              startDate: '2019-01',
              endDate: '2019-07',
              current: false,
              description: 'Supported client engagements in financial services sector focusing on process improvement and digital transformation. Conducted stakeholder interviews and documented business requirements. Created process maps and analyzed operational efficiency metrics. Assisted senior consultants in preparing client presentations and recommendations.',
              achievements: ['Supported 5+ client engagements in financial services sector', 'Conducted 50+ stakeholder interviews for business requirements', 'Created process maps improving operational efficiency by 25%']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'University College Dublin',
              degree: 'Master of Science in Business Analytics',
              field: 'Business Analytics',
              location: 'Dublin, Ireland',
              startDate: '2017-09',
              endDate: '2018-12',
              current: false,
              grade: 'First Class Honours',
              description: 'Specialized in statistical modeling, machine learning, and business intelligence. Capstone project on predicting loan default risk using ensemble methods achieved 89% accuracy.'
            },
            {
              id: '2',
              institution: 'Trinity College Dublin',
              degree: 'Bachelor of Business Studies',
              field: 'Business Studies',
              location: 'Dublin, Ireland',
              startDate: '2013-09',
              endDate: '2017-06',
              current: false,
              grade: 'First Class Honours',
              description: 'Major in Finance and Information Systems. Final year project on cryptocurrency market analysis. Treasurer of Business Society organizing events for 500+ members.'
            }
          ],
          skills: [
            { id: '1', name: 'SQL & Database Management', level: 'Advanced', category: 'Technical' },
            { id: '2', name: 'Python & R', level: 'Advanced', category: 'Technical' },
            { id: '3', name: 'Power BI & Tableau', level: 'Expert', category: 'Software' },
            { id: '4', name: 'Excel & Advanced Analytics', level: 'Expert', category: 'Software' },
            { id: '5', name: 'Statistical Modeling', level: 'Advanced', category: 'Technical' },
            { id: '6', name: 'Business Process Mapping', level: 'Advanced', category: 'Technical' },
            { id: '7', name: 'Stakeholder Management', level: 'Advanced', category: 'Soft' },
            { id: '8', name: 'Project Management', level: 'Intermediate', category: 'Soft' }
          ],
          certifications: [
            {
              id: '1',
              name: 'Certified Business Analysis Professional (CBAP)',
              issuer: 'International Institute of Business Analysis',
              issueDate: '2022-09',
              expiryDate: '2025-09',
              credentialId: 'CBAP-2022-123'
            },
            {
              id: '2',
              name: 'Microsoft Certified: Data Analyst Associate',
              issuer: 'Microsoft',
              issueDate: '2023-01',
              expiryDate: '2025-01',
              credentialId: 'MS-DA-2023-456'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Fluent', certification: '' },
            { id: '2', name: 'Mandarin Chinese', level: 'Native', certification: '' },
            { id: '3', name: 'Irish (Gaeilge)', level: 'Basic', certification: '' }
          ],
          interests: [
            { id: '1', name: 'Data Science Community', description: 'Active member of Dublin Data Science meetup group' },
            { id: '2', name: 'Financial Markets', description: 'Following fintech trends and cryptocurrency developments' },
            { id: '3', name: 'Photography', description: 'Landscape photography around Ireland' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      }
    ]
  },
  {
    id: 'retail-hospitality',
    title: 'Retail & Hospitality',
    description: 'Sales assistants, managers, chefs, and service professionals',
    icon: '🛍️',
    examples: [
      {
        id: 'retail-manager-senior',
        name: 'Sarah Murphy',
        role: 'Retail Store Manager',
        level: 'Senior Level',
        industry: 'Retail',
        description: 'Experienced retail manager with 8+ years in fashion retail',
        cvData: {
          id: 'example-7',
          personal: {
            fullName: 'Sarah Murphy',
            title: 'Retail Store Manager',
            email: 'sarah.murphy@retail.ie',
            phone: '+353 86 678 9012',
            address: 'Dublin 1, Ireland',
            linkedin: 'https://www.linkedin.com/in/sarah-murphy-retail',
            website: '',
            summary: 'Dynamic Retail Store Manager with 8+ years of experience in fashion retail management. Proven track record of exceeding sales targets, building high-performing teams, and delivering exceptional customer experiences. Expertise in visual merchandising, inventory management, and staff development. Passionate about creating inclusive retail environments that drive both customer satisfaction and business growth.'
          },
          sections: [
            { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
            { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
            { id: '3', type: 'experience', title: 'Professional Experience', visible: true, order: 3 },
            { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
            { id: '5', type: 'skills', title: 'Professional Skills', visible: true, order: 5 },
            { id: '6', type: 'certifications', title: 'Professional Development', visible: true, order: 6 }
          ],
          experience: [
            {
              id: '1',
              company: 'Zara Ireland',
              position: 'Store Manager',
              location: 'Dublin 1, Ireland',
              startDate: '2020-01',
              endDate: 'Present',
              current: true,
              description: 'Manage flagship store with €3M annual turnover and team of 25 staff members. Consistently exceed sales targets by 15-20% through effective team leadership and customer service excellence. Implement visual merchandising strategies that increase average transaction value by 12%. Oversee staff recruitment, training, and performance management processes.',
              achievements: ['Managed flagship store with €3M annual turnover and 25 staff members', 'Exceeded sales targets by 15-20% through effective team leadership', 'Increased average transaction value by 12% through visual merchandising strategies']
            },
            {
              id: '2',
              company: 'H&M Ireland',
              position: 'Assistant Store Manager',
              location: 'Dublin 2, Ireland',
              startDate: '2018-03',
              endDate: '2019-12',
              current: false,
              description: 'Supported store manager in daily operations of high-volume store with €2M annual revenue. Led visual merchandising team and coordinated product launches and promotional campaigns. Managed staff scheduling for 20+ employees and handled customer complaints resolution. Achieved 98% customer satisfaction rating in mystery shopper assessments.',
              achievements: ['Supported daily operations of store with €2M annual revenue', 'Led visual merchandising team and coordinated product launches', 'Achieved 98% customer satisfaction rating in mystery shopper assessments']
            },
            {
              id: '3',
              company: 'Brown Thomas',
              position: 'Department Supervisor',
              location: 'Dublin 2, Ireland',
              startDate: '2016-06',
              endDate: '2018-02',
              current: false,
              description: 'Supervised luxury fashion department with focus on personal styling and premium customer service. Built strong client relationships resulting in 30% repeat customer rate. Trained new staff on product knowledge and sales techniques. Coordinated with buyers on inventory management and seasonal displays.',
              achievements: ['Built strong client relationships resulting in 30% repeat customer rate', 'Trained 15+ new staff on product knowledge and sales techniques', 'Coordinated with buyers on inventory management and seasonal displays']
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Dublin Business School',
              degree: 'Higher Diploma in Retail Management',
              field: 'Retail Management',
              location: 'Dublin, Ireland',
              startDate: '2019-09',
              endDate: '2020-06',
              current: false,
              grade: 'Distinction',
              description: 'Part-time program covering retail strategy, consumer behavior, supply chain management, and digital retail trends.'
            },
            {
              id: '2',
              institution: 'Maynooth University',
              degree: 'Bachelor of Arts in English Literature',
              field: 'English Literature',
              location: 'Maynooth, Ireland',
              startDate: '2012-09',
              endDate: '2016-06',
              current: false,
              grade: '2:1 Honours',
              description: 'Developed strong communication and analytical skills through literature studies. Active member of drama society and student union.'
            }
          ],
          skills: [
            { id: '1', name: 'Team Leadership', level: 'Expert', category: 'Soft' },
            { id: '2', name: 'Sales Management', level: 'Expert', category: 'Technical' },
            { id: '3', name: 'Visual Merchandising', level: 'Advanced', category: 'Technical' },
            { id: '4', name: 'Customer Service', level: 'Expert', category: 'Soft' },
            { id: '5', name: 'Inventory Management', level: 'Advanced', category: 'Technical' },
            { id: '6', name: 'Staff Training & Development', level: 'Advanced', category: 'Soft' },
            { id: '7', name: 'POS Systems', level: 'Advanced', category: 'Software' },
            { id: '8', name: 'Fashion Styling', level: 'Advanced', category: 'Other' }
          ],
          certifications: [
            {
              id: '1',
              name: 'Retail Management Certificate',
              issuer: 'Retail Excellence Ireland',
              issueDate: '2021-03',
              expiryDate: '',
              credentialId: 'REI-2021-789'
            },
            {
              id: '2',
              name: 'Customer Service Excellence',
              issuer: 'NSAI',
              issueDate: '2020-11',
              expiryDate: '2023-11',
              credentialId: 'CSE-2020-456'
            }
          ],
          languages: [
            { id: '1', name: 'English', level: 'Native', certification: '' },
            { id: '2', name: 'Irish (Gaeilge)', level: 'Conversational', certification: '' },
            { id: '3', name: 'Spanish', level: 'Basic', certification: '' }
          ],
          interests: [
            { id: '1', name: 'Fashion Trends', description: 'Following international fashion weeks and sustainable fashion movements' },
            { id: '2', name: 'Team Sports', description: 'Playing camogie for local Dublin club' },
            { id: '3', name: 'Community Involvement', description: 'Volunteering with local homeless charity organizing clothing drives' }
          ],
          projects: [],
          template: 'harvard',
          lastModified: new Date().toISOString(),
          version: 1
        }
      }
    ]
  }
]

// Helper function to get all examples
export function getAllExamples(): ExampleCV[] {
  return EXAMPLE_CV_CATEGORIES.flatMap(category => category.examples)
}

// Helper function to get examples by category
export function getExamplesByCategory(categoryId: string): ExampleCV[] {
  const category = EXAMPLE_CV_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.examples || []
}

// Helper function to get example by ID
export function getExampleById(id: string): ExampleCV | undefined {
  return getAllExamples().find(example => example.id === id)
}