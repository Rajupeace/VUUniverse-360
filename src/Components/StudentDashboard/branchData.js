// This file contains the academic data for different branches and years.

const subjects = {
  CSE: {
    1: {
      semesters: [
        {
          sem: 1, subjects: [
            { id: 'math1', name: 'Mathematics - I', code: 'M1' },
            { id: 'phy', name: 'Applied Physics', code: 'PHY' },
            { id: 'pps', name: 'Programming for Problem Solving', code: 'PPS' },
            { id: 'ee', name: 'Basic Electrical Engineering', code: 'EE' },
            { id: 'eng', name: 'English', code: 'ENG' }
          ]
        },
        {
          sem: 2, subjects: [
            { id: 'math2', name: 'Mathematics - II', code: 'M2' },
            { id: 'chem', name: 'Engineering Chemistry', code: 'CHEM' },
            { id: 'eg', name: 'Engineering Graphics', code: 'EG' },
            { id: 'ds', name: 'Data Structures', code: 'DS' },
            { id: 'workshop', name: 'Workshop Practice', code: 'WP' }
          ]
        }
      ]
    },
    2: {
      semesters: [
        {
          sem: 3, subjects: [
            { id: 'ade', name: 'Analog & Digital Electronics', code: 'ADE' },
            { id: 'co', name: 'Computer Organization', code: 'CO' },
            { id: 'java', name: 'Object Oriented Programming (Java)', code: 'JAVA' },
            { id: 'discretemath', name: 'Discrete Mathematics', code: 'DM' },
            { id: 'coi', name: 'Constitution of India', code: 'COI' }
          ]
        },
        {
          sem: 4, subjects: [
            { id: 'dbms', name: 'Database Management Systems', code: 'DBMS' },
            { id: 'os', name: 'Operating Systems', code: 'OS' },
            { id: 'daa', name: 'Design & Analysis of Algorithms', code: 'DAA' },
            { id: 'mfcs', name: 'Mathematical Foundations of CS', code: 'MFCS' },
            { id: 'p&s', name: 'Probability & Statistics', code: 'P&S' }
          ]
        }
      ]
    },
    3: {
      semesters: [
        {
          sem: 5, subjects: [
            { id: 'cn', name: 'Computer Networks', code: 'CN' },
            { id: 'wt', name: 'Web Technologies', code: 'WT' },
            { id: 'flat', name: 'Formal Languages & Automata Theory', code: 'FLAT' },
            { id: 'pe1', name: 'Professional Elective - I', code: 'PE-I' }
          ]
        },
        {
          sem: 6, subjects: []
        }
      ]
    },
    4: {
      semesters: [
        {
          sem: 7, subjects: [
            { id: 'cc', name: 'Cloud Computing', code: 'CC' },
            { id: 'is', name: 'Information Security', code: 'IS' },
            { id: 'pe3', name: 'Professional Elective - III', code: 'PE-III' },
            { id: 'pe4', name: 'Professional Elective - IV', code: 'PE-IV' },
            { id: 'oe2', name: 'Open Elective - II', code: 'OE-II' }
          ]
        },
        {
          sem: 8, subjects: [
            { id: 'pe5', name: 'Professional Elective - V', code: 'PE-V' },
            { id: 'pe6', name: 'Professional Elective - VI', code: 'PE-VI' },
            { id: 'oe3', name: 'Open Elective - III', code: 'OE-III' },
            { id: 'project', name: 'Major Project', code: 'PROJ' }
          ]
        }
      ]
    }
  },
  IT: {
    // IT usually shares many subjects with CSE
    1: {
      semesters: [
        {
          sem: 1, subjects: [
            { id: 'math1', name: 'Mathematics - I', code: 'M1' },
            { id: 'phy', name: 'Applied Physics', code: 'PHY' },
            { id: 'itp', name: 'Introduction to Programming', code: 'ITP' },
            { id: 'bee', name: 'Basic Electrical Engineering', code: 'BEE' }
          ]
        }
      ]
    }
  },
  AIML: {
    1: {
      semesters: [
        {
          sem: 1, subjects: [
            { id: 'math1', name: 'Mathematics - I', code: 'M1' },
            { id: 'phy', name: 'Applied Physics', code: 'PHY' },
            { id: 'pps', name: 'Programming for Problem Solving', code: 'PPS' },
            { id: 'ai-intro', name: 'Introduction to AI', code: 'AI-101' }
          ]
        }
      ]
    }
  },
  ECE: {
    1: {
      semesters: [
        {
          sem: 1, subjects: [
            { id: 'm1', name: 'Mathematics - I', code: 'M1' },
            { id: 'ap', name: 'Applied Physics', code: 'AP' },
            { id: 'bee', name: 'Basic Electrical Engineering', code: 'BEE' },
            { id: 'eg', name: 'Engineering Graphics', code: 'EG' }
          ]
        }
      ]
    },
    2: {
      semesters: [
        {
          sem: 3, subjects: [
            { id: 'edc', name: 'Electronic Devices & Circuits', code: 'EDC' },
            { id: 'nt', name: 'Network Theory', code: 'NT' },
            { id: 'ss', name: 'Signals & Systems', code: 'SS' },
            { id: 'pts', name: 'Probability Theory & Stochastic Process', code: 'PTS' }
          ]
        }
      ]
    }
  },
  EEE: {},
  MECH: {},
  CIVIL: {}
};

const advancedCoursesData = {
  CSE: [],
  IT: [],
  AIML: []
};

const generateModulesForSubject = (subjectId) => {
  const getTopicResources = (topicId, topicName) => ({
    notes: [
      { id: `${topicId}-n1`, name: `${topicName} - Comprehensive Notes`, type: 'pdf', url: '#' },
      { id: `${topicId}-n2`, name: `${topicName} - Summary`, type: 'pdf', url: '#' }
    ],
    videos: [
      { id: `${topicId}-v1`, name: `${topicName} - Explained`, type: 'video', url: '#', duration: '15:00' },
      { id: `${topicId}-v2`, name: `${topicName} - Practical Example`, type: 'video', url: '#', duration: '10:30' }
    ],
    modelPapers: [
      { id: `${topicId}-mp1`, name: `${topicName} - Practice Questions`, type: 'pdf', url: '#' }
    ]
  });

  if (subjectId === 'cn') {
    return [
      {
        id: 'cn-m1',
        name: 'Module 1: Introduction to Computer Networks',
        units: [
          {
            id: 'cn-u1',
            name: 'Unit 1: Network Fundamentals',
            topics: [
              { id: 'cn-t1', name: '1.1: Network Topologies and Types', resources: getTopicResources('cn-t1', 'Network Topologies') },
              { id: 'cn-t2', name: '1.2: OSI and TCP/IP Models', resources: getTopicResources('cn-t2', 'OSI Models') }
            ]
          }
        ]
      }
    ];
  }

  const defaultModules = [
    {
      id: `${subjectId}-m1`,
      name: 'Module 1: Introduction and Basics',
      units: [
        {
          id: `${subjectId}-u1`,
          name: 'Unit 1: Fundamentals',
          topics: [
            { id: `${subjectId}-t1`, name: 'Topic 1.1: Core Concepts', resources: getTopicResources(`${subjectId}-t1`, 'Core Concepts') },
            { id: `${subjectId}-t2`, name: 'Topic 1.2: Historical Context', resources: getTopicResources(`${subjectId}-t2`, 'Historical Context') }
          ]
        }
      ]
    }
  ];

  return defaultModules;
};

const generateMaterialsForSubject = (subjectId) => {
  return {
    notes: [
      { id: 1, name: `${subjectId.toUpperCase()} - Module 1 Notes`, type: 'pdf', url: '#', size: '2.1 MB' },
    ],
    videos: [
      { id: 1, name: `Introduction to ${subjectId.toUpperCase()}`, type: 'video', url: '#', duration: '12:30' },
    ],
    modelPapers: [
      { id: 1, name: 'Mid-Term Model Paper 1', type: 'pdf', url: '#', size: '1.2 MB' },
    ]
  };
};

export const getYearData = (branch, year) => {
  if (!branch) return { semesters: [] };

  let b = String(branch).toUpperCase();
  if (b.includes('COMPUTER') || b.includes('CSE')) b = 'CSE';
  else if (b.includes('ELECTRONICS') || b.includes('ECE')) b = 'ECE';
  else if (b.includes('INFORMATION') || b.includes('IT')) b = 'IT';
  else if (b.includes('MECHANICAL') || b.includes('MECH')) b = 'MECH';
  else if (b.includes('CIVIL')) b = 'CIVIL';
  else if (b.includes('ELECTRICAL') || b.includes('EEE')) b = 'EEE';

  let yearData = subjects[b]?.[year];

  if (!yearData) return { semesters: [] };

  const formattedData = JSON.parse(JSON.stringify(yearData));

  formattedData.semesters.forEach(semester => {
    semester.subjects = semester.subjects.map(subject => ({
      ...subject,
      modules: generateModulesForSubject(subject.id),
      materials: generateMaterialsForSubject(subject.id)
    }));
  });
  return formattedData;
};

export const getAdvancedCourses = (branch) => {
  return advancedCoursesData[branch] || [];
};
