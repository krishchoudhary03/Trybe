import type { SkillPlaybook, TaskTemplate } from '../types';

const t = (key: string, title: string, description: string, hours: number): TaskTemplate => ({
  key,
  title,
  description,
  hours,
});

/**
 * Skill playbooks drive roadmap tasks, gap actions and review topics.
 * `{project}` in a description is replaced at runtime with one of the student's own projects.
 */
export const SKILL_PLAYBOOKS: SkillPlaybook[] = [
  {
    skill: 'Python',
    aliases: ['python', 'py', 'python3'],
    why: 'Python is the working language of ML, data and a large share of backend roles.',
    foundation: [t('fundamentals', 'Python fundamentals sprint', 'Work through data structures, functions and file I/O with ~30 small exercises.', 8)],
    core: [t('libraries', 'Build a CLI tool with real libraries', 'Create a command-line tool that reads CSV/JSON, cleans it and prints a report using argparse and requests.', 8)],
    project: t('project', 'Ship a Python mini-project', 'Package a small Python utility on GitHub with tests, a README and a usage demo.', 8),
    review: ['Comprehensions & generators', 'Error handling', 'Virtual environments & packaging'],
  },
  {
    skill: 'Machine Learning',
    aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'supervised learning'],
    why: 'Machine learning fundamentals are the base every AI and data role builds on.',
    foundation: [t('concepts', 'Machine learning concepts crash course', 'Cover regression, classification, train/test splits and evaluation metrics with scikit-learn notebooks.', 10)],
    core: [
      t('models', 'Train and compare 3 models on a real dataset', 'Fit linear, tree-based and ensemble models, tune hyper-parameters and compare with cross-validation.', 10),
      t('features', 'Feature engineering practice', 'Take one dataset and improve a baseline model purely through feature work; log what helped.', 6),
    ],
    project: t('project', 'Build an end-to-end ML project', 'Pick a dataset, build the pipeline, evaluate honestly and publish a write-up in your repo.', 12),
    review: ['Gradient descent', 'Overfitting & regularisation', 'Bias–variance trade-off'],
    implies: { Python: 0.6 },
  },
  {
    skill: 'Deep Learning',
    aliases: ['deep learning', 'dl', 'pytorch', 'tensorflow', 'keras', 'neural networks', 'cnn', 'transformers'],
    why: 'Deep learning underpins modern vision, language and generative AI systems.',
    foundation: [t('nn-basics', 'Neural network fundamentals', 'Implement a small neural network from scratch, then repeat it in PyTorch.', 10)],
    core: [
      t('cnn-nlp', 'Train a CNN and a small sequence model', 'Train an image classifier and a text classifier; compare training curves and fix overfitting.', 12),
    ],
    project: t('project', 'Fine-tune a pretrained model', 'Fine-tune a pretrained model on a small custom dataset and document the results.', 12),
    review: ['Backpropagation', 'Vanishing gradients', 'Learning-rate schedules'],
    implies: { Python: 0.6, 'Machine Learning': 0.6 },
  },
  {
    skill: 'RAG',
    aliases: ['rag', 'llm', 'llms', 'langchain', 'llamaindex', 'vector database', 'vector db', 'embeddings', 'prompt engineering'],
    why: 'Retrieval-augmented generation is how most companies ship useful LLM features today.',
    foundation: [t('llm-basics', 'LLM & embeddings essentials', 'Learn how tokens, embeddings and similarity search work; run embeddings on your own text.', 6)],
    core: [t('retrieval', 'Build a retrieval pipeline', 'Chunk documents, embed them, store them in a vector index and evaluate retrieval quality on 20 questions.', 8)],
    project: t('project', 'Build a RAG-based application', 'Ship a question-answering app over your own documents with citations and a simple evaluation set.', 12),
    review: ['Chunking strategies', 'Embedding similarity', 'Hallucination checks'],
    implies: { Python: 0.5 },
  },
  {
    skill: 'SQL',
    aliases: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'databases', 'database', 'dbms'],
    why: 'SQL is the common language of data — nearly every analytics and backend role uses it daily.',
    foundation: [t('queries', 'SQL querying drills', 'Practise SELECT, JOIN, GROUP BY and window functions on a sample database.', 6)],
    core: [t('schema', 'Design and query a schema', 'Model a small app (users, orders, items), add indexes and write the 10 queries it needs.', 6)],
    project: t('project', 'Add a SQL database to {project}', 'Replace in-memory or file storage in {project} with a relational database and migrations.', 6),
    review: ['Joins', 'Indexes', 'Normalisation'],
  },
  {
    skill: 'Git',
    aliases: ['git', 'github', 'gitlab', 'version control'],
    why: 'Git is table stakes — every team expects clean commits, branches and pull requests.',
    foundation: [t('workflow', 'Git workflow essentials', 'Practise branching, merging, rebasing and resolving conflicts on a throwaway repo.', 3)],
    core: [t('prs', 'Open a real pull request', 'Contribute a documentation or bug fix to an open-source repository through a PR.', 4)],
    project: t('project', 'Adopt a Git workflow in {project}', 'Move {project} to feature branches, descriptive commits and a protected main branch.', 3),
    review: ['Rebase vs merge', 'Conflict resolution', 'Commit hygiene'],
  },
  {
    skill: 'Docker',
    aliases: ['docker', 'containers', 'containerization', 'kubernetes', 'k8s'],
    why: 'Docker is how teams ship consistent environments and it appears in most engineering job listings.',
    foundation: [t('basics', 'Docker basics', 'Learn images, containers, volumes and docker-compose by running a database locally.', 3)],
    core: [t('dockerfile', 'Write production-style Dockerfiles', 'Create a multi-stage Dockerfile, keep the image small and run as a non-root user.', 4)],
    project: t('project', 'Containerize {project}', 'Containerize {project} with a Dockerfile and docker-compose and document how to run it.', 5),
    review: ['Image layers', 'Volumes & networking', 'docker-compose'],
  },
  {
    skill: 'Cloud',
    aliases: ['cloud', 'aws', 'gcp', 'azure', 'cloud computing', 'serverless', 'devops'],
    why: 'Cloud deployment skills turn local projects into services other people can actually use.',
    foundation: [t('concepts', 'Cloud fundamentals', 'Understand compute, storage, networking and IAM using a free-tier account.', 5)],
    core: [t('deploy', 'Deploy a service on the cloud', 'Deploy a container or serverless function and set up logs and a health check.', 6)],
    project: t('project', 'Deploy {project} to the cloud', 'Put {project} on a cloud platform with a public URL, environment variables and basic monitoring.', 8),
    review: ['IAM basics', 'Environment configuration', 'Cost awareness'],
  },
  {
    skill: 'HTML/CSS',
    aliases: ['html', 'css', 'html/css', 'html5', 'css3', 'tailwind', 'sass', 'responsive design'],
    why: 'Semantic, responsive HTML/CSS is the foundation of every frontend role.',
    foundation: [t('layout', 'Layout with Flexbox & Grid', 'Rebuild three real web pages using only Flexbox and Grid.', 6)],
    core: [t('responsive', 'Responsive & accessible UI', 'Make one page fully responsive and fix the top accessibility issues using an audit.', 5)],
    project: t('project', 'Rebuild a landing page pixel-perfect', 'Clone a well-designed landing page, responsive and accessible, and deploy it.', 8),
    review: ['Box model', 'Specificity', 'Accessible markup'],
  },
  {
    skill: 'JavaScript',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
    why: 'JavaScript is the language of the web — frontend and full-stack roles depend on it.',
    foundation: [t('core', 'Modern JavaScript fundamentals', 'Cover closures, async/await, modules and the DOM through 25 exercises.', 8)],
    core: [t('async', 'Async patterns & APIs', 'Build a small app that fetches, caches and renders API data with proper error handling.', 6)],
    project: t('project', 'Ship a vanilla-JS app', 'Build and deploy a small app (no frameworks) with state, routing and tests.', 8),
    review: ['Closures', 'Promises & async/await', 'Event loop'],
    implies: { 'HTML/CSS': 0.5 },
  },
  {
    skill: 'TypeScript',
    aliases: ['typescript', 'ts'],
    why: 'TypeScript is the default for serious frontend and Node codebases.',
    foundation: [t('types', 'TypeScript types in practice', 'Learn interfaces, generics and narrowing by typing an existing JavaScript module.', 5)],
    core: [t('strict', 'Migrate a module to strict mode', 'Turn on strict mode in a project and fix every error without using `any`.', 5)],
    project: t('project', 'Type {project} end-to-end', 'Add shared types between UI and data layers in {project} and remove implicit any.', 6),
    review: ['Generics', 'Union narrowing', 'Utility types'],
    implies: { JavaScript: 0.85 },
  },
  {
    skill: 'React',
    aliases: ['react', 'reactjs', 'react.js', 'next.js', 'nextjs', 'redux'],
    why: 'React is the most requested frontend framework in internships and junior roles.',
    foundation: [t('hooks', 'React components & hooks', 'Build 5 components using state, effects and context.', 8)],
    core: [t('patterns', 'State management & data fetching', 'Add routing, shared state and server data fetching with loading and error states.', 8)],
    project: t('project', 'Build and deploy a React app', 'Ship a multi-page React app with authentication-style flows and deploy it publicly.', 12),
    review: ['Effect dependencies', 'Component composition', 'State lifting'],
    implies: { JavaScript: 0.85, 'HTML/CSS': 0.7 },
  },
  {
    skill: 'UI/UX Design',
    aliases: ['ui/ux', 'ui/ux design', 'ux', 'ui', 'ux design', 'ui design', 'figma', 'design', 'prototyping', 'product design'],
    why: 'Design sense lets engineers ship interfaces people can use without friction.',
    foundation: [t('principles', 'UX principles & heuristics', 'Audit 3 apps against Nielsen’s heuristics and write down the fixes.', 4)],
    core: [t('prototype', 'Design and test a prototype', 'Prototype one flow in Figma and test it with 3 users; record what you changed.', 6)],
    project: t('project', 'Redesign a screen in {project}', 'Redesign one screen of {project}, document the decisions and ship it.', 6),
    review: ['Visual hierarchy', 'Usability testing', 'Design systems'],
  },
  {
    skill: 'Testing',
    aliases: ['testing', 'jest', 'vitest', 'pytest', 'unit testing', 'cypress', 'playwright', 'tdd'],
    why: 'Tested code ships faster and safer — teams look for engineers who write tests by default.',
    foundation: [t('unit', 'Unit testing basics', 'Write unit tests for 10 functions, covering edge cases and failure modes.', 4)],
    core: [t('integration', 'Integration & component tests', 'Add integration tests for one feature and mock the network.', 5)],
    project: t('project', 'Add a test suite to {project}', 'Reach meaningful coverage in {project} and run the tests in CI.', 6),
    review: ['Test isolation', 'Mocking', 'Coverage vs. confidence'],
  },
  {
    skill: 'REST APIs',
    aliases: ['rest apis', 'rest', 'api', 'apis', 'rest api', 'fastapi', 'express', 'express.js', 'graphql', 'flask', 'django'],
    why: 'APIs connect every modern product — designing and consuming them is core engineering work.',
    foundation: [t('http', 'HTTP & REST design', 'Learn verbs, status codes, pagination and idempotency; design an API on paper.', 4)],
    core: [t('build-api', 'Build a CRUD API with validation', 'Implement a CRUD API with input validation, error handling and auth.', 8)],
    project: t('project', 'Expose {project} through a documented API', 'Add a documented REST API to {project} with OpenAPI docs and examples.', 8),
    review: ['Status codes', 'Pagination', 'Authentication'],
    implies: { JavaScript: 0.3 },
  },
  {
    skill: 'Node.js',
    aliases: ['node.js', 'node', 'nodejs', 'npm'],
    why: 'Node.js powers a large share of backend and full-stack web services.',
    foundation: [t('runtime', 'Node.js runtime essentials', 'Learn modules, streams and the event loop by building a file-processing script.', 5)],
    core: [t('server', 'Build an HTTP server', 'Build a server with routing, middleware and structured logging.', 7)],
    project: t('project', 'Ship a Node backend for {project}', 'Build a small Node backend for {project} with persistence and deploy it.', 10),
    review: ['Event loop', 'Middleware', 'Async error handling'],
    implies: { JavaScript: 0.6 },
  },
  {
    skill: 'System Design',
    aliases: ['system design', 'architecture', 'scalability', 'distributed systems'],
    why: 'System design shows you can reason about scale, failure and trade-offs — key for backend roles.',
    foundation: [t('basics', 'System design building blocks', 'Study caching, queues, load balancing and databases with 5 worked examples.', 6)],
    core: [t('case-studies', 'Design 3 systems on paper', 'Design a URL shortener, a feed and a chat service; write the trade-offs for each.', 8)],
    project: t('project', 'Write a design doc for {project}', 'Write a design document for scaling {project} to 100× usage and review it with a mentor.', 6),
    review: ['Caching', 'Consistency vs. availability', 'Back-pressure & queues'],
  },
  {
    skill: 'Statistics',
    aliases: ['statistics', 'stats', 'probability', 'hypothesis testing', 'statistical analysis'],
    why: 'Statistics lets you tell signal from noise — the backbone of trustworthy data science.',
    foundation: [t('basics', 'Descriptive statistics & probability', 'Cover distributions, variance and conditional probability with worked problems.', 8)],
    core: [t('inference', 'Hypothesis testing & confidence intervals', 'Run an A/B test analysis end to end on a sample dataset.', 8)],
    project: t('project', 'Publish a statistical analysis', 'Analyse a public dataset, test two hypotheses and write up the conclusions.', 8),
    review: ['p-values', 'Sampling', 'Confidence intervals'],
  },
  {
    skill: 'Data Analysis',
    aliases: ['data analysis', 'pandas', 'numpy', 'excel', 'data wrangling', 'data cleaning', 'analytics'],
    why: 'Cleaning and analysing data is the day-to-day work of every data role.',
    foundation: [t('pandas', 'Pandas & NumPy workout', 'Load, clean, reshape and aggregate three messy datasets.', 8)],
    core: [t('eda', 'Exploratory data analysis', 'Run a full EDA on a real dataset and document 5 insights with evidence.', 7)],
    project: t('project', 'Deliver an analysis notebook', 'Answer a real question with data and publish a clean, reproducible notebook.', 8),
    review: ['Missing data', 'Group-by & joins', 'Outlier handling'],
    implies: { Python: 0.6 },
  },
  {
    skill: 'Data Visualization',
    aliases: ['data visualization', 'data visualisation', 'matplotlib', 'seaborn', 'tableau', 'power bi', 'd3', 'plotly', 'dashboards'],
    why: 'Clear visuals turn analysis into decisions — stakeholders rarely read raw tables.',
    foundation: [t('charts', 'Choosing the right chart', 'Recreate 10 charts and write down why each chart type fits its data.', 4)],
    core: [t('dashboard', 'Build an interactive dashboard', 'Build a dashboard with filters on a real dataset and share it.', 6)],
    project: t('project', 'Publish a data story', 'Create a visual data story with annotations and publish it publicly.', 6),
    review: ['Chart selection', 'Colour & accessibility', 'Annotation'],
  },
];

const PLAYBOOK_BY_SKILL = new Map(SKILL_PLAYBOOKS.map(p => [p.skill, p]));

const ALIAS_TO_SKILL = new Map<string, string>();
for (const p of SKILL_PLAYBOOKS) {
  ALIAS_TO_SKILL.set(p.skill.toLowerCase(), p.skill);
  for (const a of p.aliases) ALIAS_TO_SKILL.set(a.toLowerCase(), p.skill);
}

export function getPlaybook(skill: string): SkillPlaybook | undefined {
  return PLAYBOOK_BY_SKILL.get(skill);
}

/** Map free text ("reactjs", "Figma", "ml") onto a canonical skill name, or null if unknown. */
export function canonicalSkill(raw: string): string | null {
  return ALIAS_TO_SKILL.get(raw.trim().toLowerCase()) ?? null;
}

export function allCanonicalSkills(): string[] {
  return SKILL_PLAYBOOKS.map(p => p.skill);
}

export function skillSlug(skill: string): string {
  return skill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
