# Contributing to CVGenius

First off, thank you for considering contributing to CVGenius! It's people like you that make CVGenius such a great tool. We welcome contributions from everyone, whether it's a bug report, feature suggestion, documentation improvement, or code contribution.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [CVGenius Code of Conduct](docs/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [koyluoglu.cem@lll.kpi.ua](mailto:koyluoglu.cem@lll.kpi.ua).

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher (recommended: 20.x)
- **npm** 9.x or higher (or yarn/pnpm)
- **Git** for version control
- **Google Gemini API Key** ([Get free key](https://ai.google.dev/))

### Quick Start

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/cv-genius-project-v2.git
cd cv-genius-project-v2

# 3. Add upstream remote
git remote add upstream https://github.com/CemRoot/cv-genius-project-v2.git

# 4. Install dependencies
npm install

# 5. Copy environment file
cp .env.example .env.local

# 6. Start development server
npm run dev
```

## 🛠 Development Setup

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# AI Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key

# Admin Security (for admin panel testing)
ADMIN_USERNAME=admin
ADMIN_PWD_HASH_B64=your_hash
JWT_SECRET=your_secret
ADMIN_IP_WHITELIST=127.0.0.1,::1

# Audit
AUDIT_ENCRYPTION_KEY=your_key
```

### Development Commands

```bash
# Start development server
npm run dev

# Start with Turbopack (faster)
npm run dev:turbo

# Type checking
npm run type-check

# Linting
npm run lint

# Clean build cache
npm run clean

# Build for production
npm run build

# Start production server
npm start

# Run E2E tests
npm run test:e2e
```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 10, macOS 12.0]
 - Browser: [e.g. Chrome 96, Firefox 94]
 - Node Version: [e.g. 18.17.0]
 - npm Version: [e.g. 9.6.7]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Use case** - why this enhancement would be useful
- **Proposed solution** - if you have ideas on implementation
- **Alternatives** - other approaches you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues tagged with:

- `good first issue` - simpler issues perfect for newcomers
- `help wanted` - issues where we need community help
- `documentation` - documentation improvements

### Pull Requests

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly

4. **Commit your changes** following our commit convention

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request** with a clear description

## 💻 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use TypeScript types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Avoid: Using 'any'
function getData(): any {
  // ...
}
```

### React/Next.js Guidelines

```typescript
// ✅ Good: Functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={cn('btn', `btn-${variant}`)}
    >
      {label}
    </button>
  );
};

// ❌ Avoid: Class components (unless necessary)
class Button extends React.Component {
  // ...
}
```

### Code Style

- **Use meaningful variable names**
  ```typescript
  // ✅ Good
  const userEmailAddress = 'user@example.com';

  // ❌ Avoid
  const x = 'user@example.com';
  ```

- **Keep functions small and focused**
  ```typescript
  // ✅ Good: Single responsibility
  function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  function applyDiscount(total: number, discountPercent: number): number {
    return total * (1 - discountPercent / 100);
  }
  ```

- **Use const by default, let when reassignment is needed**
  ```typescript
  // ✅ Good
  const apiUrl = 'https://api.example.com';
  let counter = 0;

  // ❌ Avoid
  var apiUrl = 'https://api.example.com';
  ```

- **Prefer async/await over promises**
  ```typescript
  // ✅ Good
  async function fetchData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // ❌ Avoid
  function fetchData() {
    return fetch('/api/data')
      .then(response => response.json())
      .then(data => data)
      .catch(error => console.error(error));
  }
  ```

### File Organization

```
src/
├── components/           # Reusable UI components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and helpers
│   ├── utils.ts         # General utilities
│   └── constants.ts     # App constants
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── store/               # Zustand stores
```

### Component Structure

```typescript
// Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// Types/Interfaces
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

// Component
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onSave
}) => {
  // Hooks
  const [isLoading, setIsLoading] = React.useState(false);

  // Event handlers
  const handleSave = async () => {
    setIsLoading(true);
    await onSave();
    setIsLoading(false);
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};
```

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi colons, etc)
- **refactor**: Code refactoring without functionality changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD configuration changes
- **build**: Build system changes

### Examples

```bash
# Feature
git commit -m "feat(cv-builder): add drag and drop section reordering"

# Bug fix
git commit -m "fix(admin): resolve 2FA token validation issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple lines
git commit -m "feat(api): add cover letter generation endpoint

- Add new API route for cover letter generation
- Implement AI prompt templates
- Add rate limiting to endpoint"
```

### Scope

The scope should be the area of the codebase affected:

- `cv-builder` - CV builder features
- `admin` - Admin panel
- `api` - API routes
- `ui` - UI components
- `auth` - Authentication
- `security` - Security features
- `docs` - Documentation

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure tests pass**: `npm run test:e2e`
4. **Check TypeScript**: `npm run type-check`
5. **Lint your code**: `npm run lint`
6. **Build successfully**: `npm run build`

### PR Title Format

Follow the same convention as commit messages:

```
feat(cv-builder): add export to PDF functionality
fix(admin): resolve login session timeout issue
docs(contributing): improve setup instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #(issue number)
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Approval** required before merging
4. **Squash and merge** for clean commit history

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// cypress/e2e/cv-builder.cy.ts
describe('CV Builder', () => {
  beforeEach(() => {
    cy.visit('/builder');
  });

  it('should load the CV builder page', () => {
    cy.get('h1').should('contain', 'CV Builder');
  });

  it('should add a new work experience', () => {
    cy.get('[data-testid="add-experience"]').click();
    cy.get('[data-testid="company-input"]').type('Acme Corp');
    cy.get('[data-testid="save-experience"]').click();
    cy.get('[data-testid="experience-list"]')
      .should('contain', 'Acme Corp');
  });
});
```

### Test Coverage

- Write tests for **new features**
- Add tests for **bug fixes** to prevent regression
- Focus on **critical user paths**
- Test **edge cases** and **error handling**

## 📚 Documentation

### Code Comments

```typescript
/**
 * Generates a CV in PDF format
 *
 * @param cvData - The CV data to convert
 * @param templateId - The template to use for styling
 * @returns A promise that resolves to a PDF blob
 * @throws Error if template is not found
 */
async function generatePDF(
  cvData: CVData,
  templateId: string
): Promise<Blob> {
  // Implementation
}
```

### Documentation Files

- Update **README.md** for significant changes
- Update **docs/** for new features
- Add **inline comments** for complex logic
- Document **API changes** in API docs

## 🌍 Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Pull Requests** - Code contributions
- **Email** - koyluoglu.cem@lll.kpi.ua (security issues)

### Getting Help

- Check the [documentation](docs/)
- Search [existing issues](https://github.com/CemRoot/cv-genius-project-v2/issues)
- Ask in [GitHub Discussions](https://github.com/CemRoot/cv-genius-project-v2/discussions)

## 🎯 Priority Areas

We're particularly interested in contributions in these areas:

1. **CV Templates** - New professional templates
2. **AI Prompts** - Improved AI prompt engineering
3. **Internationalization** - Multi-language support
4. **Accessibility** - WCAG compliance improvements
5. **Performance** - Optimization opportunities
6. **Testing** - Increased test coverage
7. **Documentation** - Tutorial videos, guides

## 📄 License

By contributing to CVGenius, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Recognition

All contributors will be recognized in our [README.md](README.md) and release notes.

---

## 💡 Questions?

Don't hesitate to ask questions! We're here to help:

- Open an issue with the `question` label
- Email: koyluoglu.cem@lll.kpi.ua
- Check our [FAQ](docs/FAQ.md)

---

**Thank you for contributing to CVGenius! 🎉**

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making CVGenius better for everyone.

---

<div align="center">

**Happy Coding!** 💻✨

[⬆ Back to Top](#contributing-to-cvgenius)

</div>
