// Available topics for users to choose from
export const TOPICS = [
    'Artificial Intelligence',
    'Philosophy',
    'Psychology',
    'History',
    'Science',
    'Technology',
    'Business & Startups',
    'Personal Finance',
    'Health & Wellness',
    'Productivity',
    'Creative Writing',
    'Design',
    'Mathematics',
    'Physics',
    'Biology',
    'Economics',
    'Politics',
    'Sociology',
    'Literature',
    'Art History',
    'Music Theory',
    'Sustainability',
    'Space & Astronomy',
    'Neuroscience',
];

// Reading frequency options
export const READING_DAYS = [
    { value: 'weekdays', label: 'Weekdays Only', description: 'Monday through Friday' },
    { value: 'weekends', label: 'Weekends Only', description: 'Saturday and Sunday' },
    { value: 'daily', label: 'Every Day', description: 'All 7 days of the week' },
] as const;
