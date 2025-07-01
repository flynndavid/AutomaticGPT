# 📝 Documentation Templates

This directory contains template files that AI agents and developers should use when creating documentation for new features.

## 🎯 Purpose

These templates ensure:

- ✅ **Consistency** across all feature documentation
- ✅ **Completeness** - no important sections are missed
- ✅ **Quality** - all documentation follows the same high standards
- ✅ **Efficiency** - faster documentation creation

## 📁 Available Templates

| Template                                                     | Purpose                              | When to Use       |
| ------------------------------------------------------------ | ------------------------------------ | ----------------- |
| [`feature-readme-template.md`](./feature-readme-template.md) | Feature overview and API reference   | Every new feature |
| [`feature-setup-template.md`](./feature-setup-template.md)   | Installation and configuration guide | Every new feature |

## 🚀 How to Use Templates

### For AI Agents

When implementing a new feature, follow this process:

1. **Create Feature Directory**

   ```bash
   mkdir -p docs/features/{feature-name}
   ```

2. **Copy Templates**

   ```bash
   # Copy the main template
   cp docs/templates/feature-readme-template.md docs/features/{feature-name}/README.md

   # Copy the setup template
   cp docs/templates/feature-setup-template.md docs/features/{feature-name}/setup.md
   ```

3. **Customize Content**
   - Replace all `{Feature Name}` placeholders with the actual feature name
   - Replace all `{feature-name}` placeholders with the kebab-case feature name
   - Replace all `{FEATURE}` placeholders with the UPPER_CASE feature name
   - Fill in actual implementation details from the code

4. **Update References**
   - Update [`docs/features/README.md`](../features/README.md) with the new feature
   - Update [`docs/FEATURES.md`](../FEATURES.md) with feature status
   - Add setup instructions to [`docs/SETUP.md`](../SETUP.md) if needed

### For Human Developers

Same process as above, but you can manually edit the templates in your preferred editor.

## 🔄 Template Customization

### Placeholder Replacement Guide

| Placeholder      | Replace With                | Example                 |
| ---------------- | --------------------------- | ----------------------- |
| `{Feature Name}` | Human-readable feature name | `Authentication System` |
| `{feature-name}` | Kebab-case directory name   | `authentication`        |
| `{FEATURE}`      | Upper-case env var format   | `AUTH`                  |

### Required Sections

Every feature documentation MUST include:

#### In README.md:

- 🎯 **Overview** - What the feature does and why it's useful
- ⚡ **Quick Start** - Minimal setup to get started
- 🔧 **Configuration** - All environment variables and options
- ✨ **Features** - Complete feature list with status
- 📝 **Usage** - Code examples and patterns
- 🎨 **Customization** - Styling and theming options
- 🔌 **API Reference** - Complete API documentation
- 🚨 **Troubleshooting** - Common issues and solutions
- 📚 **Related Documentation** - Cross-references

#### In setup.md:

- 📋 **Prerequisites** - Required dependencies and tools
- 🔧 **Installation** - Step-by-step setup process
- ⚙️ **Configuration Options** - Detailed configuration guide
- ✅ **Verification** - How to test the setup
- 🚨 **Troubleshooting** - Setup-specific issues
- 🔒 **Security Considerations** - Best practices

## ✅ Quality Checklist

Before publishing feature documentation, ensure:

- [ ] All placeholders are replaced with actual values
- [ ] Code examples are tested and working
- [ ] Environment variables are accurate
- [ ] Links to other documentation work
- [ ] Troubleshooting covers real issues
- [ ] API reference is complete
- [ ] Examples use actual implementation code
- [ ] Security considerations are addressed
- [ ] Cross-references are updated

## 📊 Template Examples

### Good Documentation Examples

See these well-documented features:

- 🤖 [`docs/features/chat/README.md`](../features/chat/README.md) - Complete AI chat documentation

### Template Usage Example

```bash
# Creating documentation for a new "notifications" feature

# 1. Create directory
mkdir -p docs/features/notifications

# 2. Copy templates
cp docs/templates/feature-readme-template.md docs/features/notifications/README.md
cp docs/templates/feature-setup-template.md docs/features/notifications/setup.md

# 3. Replace placeholders
# {Feature Name} → Notifications
# {feature-name} → notifications
# {FEATURE} → NOTIFICATIONS

# 4. Update central documentation
# Add to docs/features/README.md
# Update docs/FEATURES.md
# Update docs/SETUP.md if needed
```

## 🔄 Template Maintenance

### When to Update Templates

- 🆕 New sections become common across features
- 🔧 Documentation structure changes
- 📊 Quality standards evolve
- 🎨 Formatting or style improvements

### How to Update Templates

1. 📝 Modify the template files
2. 🔄 Update this README with changes
3. 📢 Inform team about template updates
4. ✅ Update existing documentation to match (optional)

## 🤝 Contributing

### Improving Templates

If you notice patterns in feature documentation that could be standardized:

1. 📝 Propose template improvements
2. 🔍 Review existing feature documentation
3. 📊 Identify common patterns
4. 🆕 Submit pull request with template updates

### Feedback

If templates are missing important sections or are unclear:

1. 🆕 Create an issue with the [Documentation Issue template](../../.github/ISSUE_TEMPLATE/documentation_issue.md)
2. 💡 Suggest specific improvements
3. 📝 Provide examples of what's missing

---

**Remember:** Good templates lead to good documentation, which makes this template valuable to the community. Always keep templates comprehensive and up-to-date!
