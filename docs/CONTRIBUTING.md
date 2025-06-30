# Contributing to CV Genius

Thank you for your interest in contributing to CV Genius! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cv-genius-project-v2.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "feat: add new feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Commit Convention

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

## Pull Request Guidelines

- Keep PRs focused and small
- Update documentation if needed
- Add tests for new features
- Ensure all tests pass
- Update the README if needed

## Reporting Issues

- Use the issue templates
- Provide clear descriptions
- Include steps to reproduce
- Add screenshots if applicable

## API Keys and Secrets

**Never commit API keys or secrets!** Use environment variables:

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
```

## Questions?

Feel free to open an issue for any questions!