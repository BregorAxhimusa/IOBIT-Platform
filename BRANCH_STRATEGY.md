# Branch Strategy

IOBIT përdor një Git branching strategy me tre degë kryesore:

## 📌 Branch Overview

### 1. `main` - Production Branch
- **Qëllimi**: Përmban kodin e stabil dhe gati për production
- **Deployment**: Automatikisht deploy në production environment
- **Protection**: Protected branch - requires pull request reviews
- **Merges from**: `development` (vetëm pas testing të plotë)

### 2. `development` - Development Branch
- **Qëllimi**: Degë kryesore e zhvillimit
- **Testing**: QA testing dhe integration testing
- **Merges from**: Feature branches dhe `testing-local`
- **Merges to**: `main` (kur është gati për production)

### 3. `testing-local` - Local Testing Branch
- **Qëllimi**: Testing lokal para se të merge në development
- **Usage**: Për të testuar ndryshime të reja lokalisht
- **Synced with**: `development` (duhet të jenë gjithmonë në sync)
- **Merges to**: `development` (pas testing të suksesshëm)

## 🔄 Workflow

### Feature Development
```bash
# 1. Create feature branch from development
git checkout development
git pull origin development
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "Add your feature"

# 3. Push to remote
git push origin feature/your-feature-name

# 4. Create Pull Request to development
# Review → Approve → Merge to development
```

### Local Testing
```bash
# 1. Checkout testing-local
git checkout testing-local
git pull origin testing-local

# 2. Merge from development
git merge development

# 3. Test locally
npm run dev
# Run tests, check functionality

# 4. If tests pass, merge back to development
git checkout development
git merge testing-local
git push origin development
```

### Production Release
```bash
# 1. Ensure development is stable
git checkout development
npm run build
npm run lint

# 2. Create Pull Request from development to main
# Title: "Release v1.x.x"
# Description: List of changes and new features

# 3. After review and approval
git checkout main
git merge development
git push origin main

# 4. Tag the release
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin v1.x.x
```

## 🚫 Branch Protection Rules

### `main` branch
- ✅ Require pull request reviews (1 approver minimum)
- ✅ Require status checks to pass (CI/CD)
- ✅ Require branches to be up to date
- ❌ No direct pushes allowed

### `development` branch
- ✅ Require status checks to pass (CI/CD)
- ⚠️ Direct pushes allowed (for quick fixes)
- ✅ Automatically delete head branches after merge

### `testing-local` branch
- ✅ Open for testing and experimentation
- ✅ Synced with development regularly
- ⚠️ Can be reset if needed

## 📋 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:
```bash
feat(trading): add limit order functionality
fix(websocket): resolve connection timeout issue
docs(readme): update installation instructions
refactor(store): simplify market data state management
```

## 🔧 CI/CD Integration

### Automated Checks (All Branches)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification
- ✅ Security audit

### Deployment
- `main` → Production (Vercel/Custom server)
- `development` → Staging environment
- `testing-local` → Local only

## 📞 Support

For questions about branching strategy, contact the development team or create an issue in GitHub.
