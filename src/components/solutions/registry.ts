// TSX Solutions Registry
// Centralized metadata for all available solutions

export interface SolutionMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  lastUpdated: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  component: string; // Path to component
  thumbnail?: string;
  featured?: boolean;
}

export const solutionsRegistry: SolutionMetadata[] = [
  {
    id: 'sftp-connection-guide',
    title: 'SFTP Remote Connection Guide',
    description: 'Comprehensive guide for connecting to SFTP servers with SSH key authentication. Includes instructions for Windows, Linux, macOS, troubleshooting, and security best practices.',
    category: 'System Administration',
    tags: ['SFTP', 'SSH', 'File Transfer', 'Security', 'Remote Access', 'Windows Server'],
    author: 'DevOps Team',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    difficulty: 'Intermediate',
    component: 'SFTPConnectionGuide',
    featured: true
  },
  {
    id: 'ssh-key-guide',
    title: 'SSH Key Generation & Management Guide',
    description: 'Complete guide for generating, managing, and using SSH keys across Windows, Linux, and macOS. Includes key types comparison, usage with GitHub/GitLab, security best practices, and comprehensive troubleshooting.',
    category: 'Security & Authentication',
    tags: ['SSH', 'Security', 'Authentication', 'GitHub', 'GitLab', 'Key Management', 'ED25519', 'RSA'],
    author: 'DevOps Team',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    difficulty: 'Beginner',
    component: 'SSHKeyGuide',
    featured: true
  }
  // Add more solutions here as they are created
];

export const getCategories = (): string[] => {
  const categories = new Set(solutionsRegistry.map(s => s.category));
  return Array.from(categories).sort();
};

export const getTags = (): string[] => {
  const tags = new Set(solutionsRegistry.flatMap(s => s.tags));
  return Array.from(tags).sort();
};

export const getSolutionById = (id: string): SolutionMetadata | undefined => {
  return solutionsRegistry.find(s => s.id === id);
};

export const searchSolutions = (query: string): SolutionMetadata[] => {
  const lowerQuery = query.toLowerCase();
  return solutionsRegistry.filter(s =>
    s.title.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    s.category.toLowerCase().includes(lowerQuery)
  );
};

export const filterByCategory = (category: string): SolutionMetadata[] => {
  if (category === 'All') return solutionsRegistry;
  return solutionsRegistry.filter(s => s.category === category);
};

export const filterByDifficulty = (difficulty: string): SolutionMetadata[] => {
  if (difficulty === 'All') return solutionsRegistry;
  return solutionsRegistry.filter(s => s.difficulty === difficulty);
};
